import moment from "moment";

export default function validateDate(value) {
  const payday = moment(value).startOf("day");
  const today = moment().startOf("day");

  if (!payday.isValid() || payday.isBefore(today, "day")) {
    return false;
  }
  return true;
}
