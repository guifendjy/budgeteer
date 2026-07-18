import formatCurrency from "../utils/formatCurrency";
import formatDate from "../utils/formatDate";
import getPercentage from "../utils/getPercentage";
import filterBills from "../utils/filterBills";

// since shadow realm doesn't support a plugin to add helpers, we create a store that will be used as a plugin to add global helpers

export default function Helpers() {
  return {
    $formatCurrency: formatCurrency,
    $formatDate: formatDate,
    $getPercentage: getPercentage,
    $filterBills: filterBills,
  };
}
