export default function formatCurrency(value, currency) {
  if (typeof value !== "number") {
    return value;
  }

  // Currency options:
  // USD - United States Dollar
  // EUR - Euro
  // GBP - British Pound Sterling
  // JPY - Japanese Yen
  // CAD - Canadian Dollar
  // AUD - Australian Dollar
  let res = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value);
  return res;
}
