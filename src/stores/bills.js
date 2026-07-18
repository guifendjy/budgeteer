import validateDate from "../utils/validateDate";
import { PersistenceService } from "../services/Persistence";
import { UserIdentityService } from "../services/UserIdentity";
import { DataScheduler } from "../services/dataScheduler";
import moment from "moment";

export default function () {
  return {
    bills: [],

    add(bill) {
      bill = { ...bill, owner_id: this.$store.UserStore.id }; // apply owner id here
      this.bills = [...this.bills, bill];

      if (this.$store.UserStore.id)
        PersistenceService.save("bills", bill, this.$store.UserStore.tier);

      // trigger change in the budget
      this.$store.BudgetStore.updateBudget();
    },
    update(billId, field, value) {
      if (field === "due_date" && !validateDate(value)) {
        this.$store.ToastStore.add("due date must be today or later", "error");
        return;
      }
      const bill = this.bills.find((b) => b.id === billId);
      if (!bill) return;

      const getPaidBill = (bill) => {
        const now = moment();
        let nextDueDate = moment(bill.due_date);
        if (!nextDueDate.isValid()) {
          nextDueDate = now.clone();
        }

        switch (bill.recurrence) {
          case "weekly":
            while (nextDueDate.isSameOrBefore(now, "day")) {
              nextDueDate.add(1, "week");
            }
            break;
          case "monthly":
            while (nextDueDate.isSameOrBefore(now, "day")) {
              nextDueDate.add(1, "month");
            }
            break;
          case "annually":
            while (nextDueDate.isSameOrBefore(now, "day")) {
              nextDueDate.add(1, "year");
            }
            break;
          default:
            return { ...bill, status: "paid" };
        }

        return {
          ...bill,
          status: "paid",
          due_date: nextDueDate.toISOString(),
        };
      };

      const updatedBill =
        field === "status" && value === "paid"
          ? getPaidBill(bill)
          : { ...bill, [field]: value };

      // schedule change -> 10 seconds to lessen db reach
      DataScheduler.persist("bills", updatedBill, 1000 * 10);

      this.bills = this.bills.map((b) => (b.id === billId ? updatedBill : b));

      if (this.$store.SelectedBillStore.selectedBill?.id === billId) {
        this.$store.SelectedBillStore.selectedBill = updatedBill;
      }

      this.$store.BudgetStore.updateBudget();
      this.$store.ToastStore.add("Bill updated", "success");
    },
    delete(billId) {
      this.bills = this.bills.filter((b) => b.id !== billId);
      this.$store.BudgetStore.updateBudget();

      PersistenceService.delete("bills", billId);
      // clear selected bill if it's the one being deleted
      if (this.$store.SelectedBillStore.selectedBill.id === billId) {
        this.$store.SelectedBillStore.clearSelectedBill();
      }
    },
    async init() {
      const user = await UserIdentityService.exists();
      if (user) {
        const bills = await PersistenceService.loadAllBills(user.id);
        this.bills = bills.map((bill) => {
          if (bill.due_date) {
            const dueDate = moment(bill.due_date);
            const isOverdue = dueDate.isBefore(moment(), "day");
            return {
              ...bill,
              due_date: dueDate.toISOString(),
              status:
                isOverdue ? "overdue" : bill.status || "pending",
            };
          }
          return bill;
        });
      }
    },
  };
}
