import moment from "moment";
import validateDate from "../utils/validateDate";
import { DataScheduler } from "../services/dataScheduler";
import { PersistenceService } from "../services/Persistence";
import { UserIdentityService } from "../services/UserIdentity";
import formatDate from "../utils/formatDate";

const MULTIPLIERS = {
  weekly: 4,
  "bi-weekly": 2,
  monthly: 1,
};

export default function () {
  // we can use services here to grab data
  // from indexDb or cloud depending

  return {
    cleared_balance: 0, // to test it, but default should be 0.
    next_deposit_date: null,
    next_deposit_amount: 0,
    safe_to_spend: 0,
    total_obligations: 0,
    pay_frequency: null, // 'weekly', 'bi-weekly', 'monthly'
    low_balance_alert: null, // {type, projectedDate, dipAmount, triggerBill, triggerAmount, triggerDate}
    monthly_income_anchor: 0,
    categoryExposure: [],

    // will set later
    // last_updated: null,  // will use this eventually

    isInitialized: false, // This triggers the modal
    updateInflowParams(key, value) {
      if (key === "next_deposit_date") {
        if (!validateDate(value)) {
          this.$store.ToastStore.add(
            "next deposit date must be today or later",
            "error",
          );
          return;
        }
      }

      this[key] = value;

      this.updateBudget(); // re-calculate budget
      this.$store.ToastStore.add("updated successfully", "success");

      // update db in 10 seconds
      if (this.$store.UserStore.id) {
        // save update
        // Debounce persistence to avoid excessive database writes.
        // The budget state can be updated independently, so we wait before persisting.

        DataScheduler.persist(
          "budget",
          {
            userId: this.$store.UserStore.id, // create user id here
            cleared_balance: this.cleared_balance,
            next_deposit_date: this.next_deposit_date,
            next_deposit_amount: this.next_deposit_amount,
            pay_frequency: this.pay_frequency,
          },
          1000 * 10,
        );
      }
    },
    completeOnboarding(data) {
      if (!validateDate(data.payday)) {
        this.$store.ToastStore.add(
          "next deposit date must be today or later",
          "error",
        );
        return;
      }

      this._setupUserProfile(data);

      this.isInitialized = true;
    },
    async _setupUserProfile(data) {
        this.cleared_balance = parseFloat(data.balance) || 0;
        this.next_deposit_date = data.payday;
        this.next_deposit_amount = parseFloat(data.amount || 0);
        this.pay_frequency = data.frequency;

        const userProfile = await UserIdentityService.CreateLocalUser();

        PersistenceService.save(
          "budget",
          {
            userId: userProfile.id, // create user id here
            cleared_balance: this.cleared_balance,
            next_deposit_date: this.next_deposit_date,
            next_deposit_amount: this.next_deposit_amount,
            pay_frequency: this.pay_frequency,
          },
        );

        // set user id, that will be used througout the app to save bills and trigger updates and other changes.
        this.$store.UserStore.id = userProfile.id;

      // calculate safe-to-spend and total-obligations
      this.updateBudget();
    },
    updateBudget() {
      this._updateTotalObligation();
      this._updateSafeToSpend();
      this._updateMonthlyIncomeAnchor();

      // this depends on previously updated fields, so call it at the end.
      this._updateCategoryExposure();
      // this triggers when money will be tight before payday, so it should be the last thing to update after all calculations are done.
      // schedule db update to avoid committing too soon.
      this._lowBalanceAlert();
    },
    _updateMonthlyIncomeAnchor() {
      // Normalize to a standard 30-day (monthly) period
      this.monthly_income_anchor =
        this.next_deposit_amount * MULTIPLIERS[this.pay_frequency];
    },
    _updateTotalObligation() {
      // updates obligations
      this.total_obligations =
        this.$store.BillStore.bills.reduce((sum, b) => sum + b.amount, 0) || 0; // no bills means you can spend all available mone.
    },
    _updateSafeToSpend() {
      const payday = moment(this.next_deposit_date).startOf("day");
      const balance = parseFloat(this.cleared_balance || 0);

      const immediateObligations = (this.$store.BillStore.bills || [])
        .filter((b) => {
          const isNotPaid = b.status !== "paid";
          const dueDate = moment(b.due_date).startOf("day");

          return isNotPaid && dueDate.isSameOrBefore(payday, "day");
        })
        .reduce((sum, b) => sum + parseFloat(b.amount), 0);

      // after "locking away" the money for those immediate bills.
      this.safe_to_spend = balance - immediateObligations;
    },
    _updateCategoryExposure() {
      const bills = this.$store.BillStore.bills || [];

      // NOTE: total commitment here refers to 'total_obligations'
      // bills to be paid that month.
      // but I think % should be evaluated based off the
      // 'monthly_income_anchor' inference.

      const totalCommitment = this.monthly_income_anchor; // '??' this.total_obligations

      // Group by category name
      const groups = bills.reduce((acc, b) => {
        const cat = b.metadata.category;
        acc[cat] = (acc[cat] || 0) + parseFloat(b.amount || 0);
        return acc;
      }, {});

      // update exposure
      this.categoryExposure = Object.keys(groups)
        .map((name) => ({
          name,
          amount: groups[name],
          percentage:
            totalCommitment > 0 ? (groups[name] / totalCommitment) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount); // Show biggest eaters first
    },
    _lowBalanceAlert() {
      const payday = moment(this.next_deposit_date);
      let runningBalance = parseFloat(this.cleared_balance || 0);
      const threshold = 50; // The "Danger Zone" amount

      // 1. Get all unpaid bills due before or on payday, sorted by date
      const upcomingBills = (this.$store.BillStore.bills || [])
        .filter(
          (b) =>
            b.status !== "paid" &&
            moment(b.due_date).isSameOrBefore(payday, "day"),
        )
        .sort((a, b) => moment(a.due_date) - moment(b.due_date));

      // 2. Simulate the flow
      for (const bill of upcomingBills) {
        runningBalance -= parseFloat(bill.amount);

        // 3. Trigger the alert at the FIRST point of failure
        if (runningBalance < threshold) {
          this.low_balance_alert = {
            type: "danger",
            projectedDate: formatDate(bill.due_date, {
              relative: false,
              prefix: false,
            }),
            dipAmount: runningBalance,
            triggerBill: bill.name,
            triggerAmount: bill.amount,
            triggerDate: formatDate(bill.due_date),
          };
        } else {
          this.low_balance_alert = null; // Clear alert if balance recovers above threshold
        }
      }
    },
    async init() {
      const user = await UserIdentityService.exists();

      if (user) {
        try {
          // grab budget data from db
          const budget = await PersistenceService.loadBudget(user.id);

          this.cleared_balance = budget.cleared_balance || 0;
          this.next_deposit_date = budget.next_deposit_date;
          this.next_deposit_amount = budget.next_deposit_amount || 0;
          this.pay_frequency = budget.pay_frequency;

          this.isInitialized = true;

          // this uses budget data to generate other calculations lol
          this.updateBudget();
        } catch (error) {
          console.error("Error: failed to load user budget.");
          this.$store.ToastStore.add("failed loading budget", "error");
        }
      }
    },
  };
}
