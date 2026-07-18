// Simple search filter for the dropdown
const filterBills = (bills = [], query) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return bills
    .filter(
      (b) =>
        b.name.toLowerCase().startsWith(q) ||
        b.metadata.category.toLowerCase().startsWith(q),
    )
    .slice(0, 5);
};

export default filterBills;
