export default function () {
  return {
    selectedBill: null, // for testing
    selectBill(bill) {
      this.selectedBill = bill;

      // scroll to view and focus
      setTimeout(() => {
        this.$refs.selectedBillRef?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    },
    clearSelectedBill() {
      const bills = this.$store.BillStore.bills;

      // wrap around to the next bill if the current selected bill is deleted
      const nextIndex =
        (bills.findIndex((b) => b.id === this.selectedBill.id) + 1) %
        bills.length;
      this.selectedBill = bills[nextIndex] || null;
    },
  };
}
