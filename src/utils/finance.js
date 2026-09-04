import moment from "moment";
import { v4 as uniqId } from "uuid";
import inferCategory from "./inferBillCategory";

const recurrenceMap = [
  "weekly",
  "monthly",
  "annually",
  "daily",
  "biweekly",
  "quarterly",
  "semiannually",
  "once",
];

const parseBillQuery = (query) => {
  if (!query) return { valid: false, missing: ["name", "amount"] };

  const parts = query.trim().split(/\s+/);
  const amountIndex = parts.findIndex((part) => /^-?\d+(\.\d+)?$/.test(part));
  const amount = amountIndex !== -1 ? parseFloat(parts[amountIndex]) : 0;

  const rawName = parts
    .slice(0, amountIndex > 0 ? amountIndex : 1)
    .join(" ")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();

  const name = rawName
    ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
    : "";

  const remaining = parts
    .slice(amountIndex + 1)
    .map((token) => token.toLowerCase());

  const dateText = remaining
    .filter((token) =>
      /^(?:\d{1,2}(?:st|nd|rd|th)?|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{4})$/.test(
        token,
      ),
    )
    .join(" ");

  let dueDate = moment().startOf("day");

  if (dateText) {
    const parsed = moment(
      dateText,
      [
        "MMMM D",
        "MMM D",
        "D MMMM",
        "D MMM",
        "MMMM Do",
        "MMM Do",
        "Do MMMM",
        "Do MMM",
      ],
      true,
    );

    if (parsed.isValid()) {
      dueDate = parsed.startOf("day");
      if (dueDate.isBefore(moment().startOf("day"))) {
        dueDate.add(1, "year");
      }
    } else {
      const dayOnly = moment(dateText, ["D", "Do"], true);
      if (dayOnly.isValid()) {
        dueDate = dayOnly.startOf("day");
        while (dueDate.isBefore(moment().startOf("day"))) {
          dueDate.add(1, "month");
        }
      }
    }
  }

  const recurrence =
    recurrenceMap.find((rec) =>
      remaining.some((token) => rec.startsWith(token)),
    ) || "monthly";

  const category = inferCategory(name.toLowerCase()) || "Uncategorized";

  return {
    valid: !!(name && amount > 0),
    missing: [!name && "name", amount <= 0 && "amount"].filter(Boolean),
    owner_id: null,
    id: `bill_${uniqId()}`,
    name,
    amount,
    currency: "USD",
    due_date: dueDate.toISOString(),
    recurrence,
    status: "pending",
    created_at: moment().toISOString(),
    updated_at: null,
    version: 1,
    metadata: {
      category,
      is_tax_deductible: true,
    },
  };
};

export default parseBillQuery;
