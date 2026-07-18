import parseBillQuery from "../utils/finance";
import filterBills from "../utils/filterBills";
import formatDate from "../utils/formatDate";

// header state
export default function () {
  return {
    isExpanded: false,
    query: "",
    parseBillQuery,
    filterBills,
    formatDate,
  };
}
