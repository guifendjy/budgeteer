export default function getPercentage(amount, sum) {
  return sum === 0 ? 0 : ((amount / sum) * 100).toFixed(2);
}
