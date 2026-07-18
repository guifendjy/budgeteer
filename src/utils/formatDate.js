import moment from "moment";

export default function formatDate(date, options = {}) {
  const {
    format = "MMM D",
    prefix = true,
    relative = true,
    short = false,
    showOverdue = true,
  } = options;

  if (date == null) {
    return formatDate(Date.now(), {
      relative: false,
      prefix: false,
      format: "MMM DD",
    });
  }

  const now = moment().startOf("day");
  const target = moment(date).startOf("day");
  const diff = target.diff(now, "days");

  if (relative) {
    if (diff === 0) return short ? "Today" : "Due today";
    if (diff === 1) return short ? "Tomorrow" : "Due tomorrow";
    if (diff > 1 && diff <= 6)
      return short ? `${diff}d` : `Due in ${diff} days`;

    if (diff < 0 && showOverdue) {
      const days = Math.abs(diff);
      if (days === 1) return short ? "1d late" : "1 day overdue";
      if (days <= 6) return short ? `${days}d late` : `${days} days overdue`;
    }
  }

  const formatted = target.format(format);
  if (!prefix) return formatted;
  return diff < 0 && showOverdue ? `Overdue ${formatted}` : `Due ${formatted}`;
}
