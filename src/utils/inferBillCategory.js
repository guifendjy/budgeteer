const BILL_CATEGORIES = {
  housing: [
    "rent",
    "mortgage",
    "property tax",
    "homeowners association",
    "renters insurance",
    "home insurance",
  ],
  utilities: [
    "electricity",
    "water",
    "gas",
    "trash",
    "sewer",
    "internet",
    "cable",
    "phone",
  ],
  transportation: [
    "car payment",
    "car insurance",
    "fuel",
    "parking",
    "tolls",
    "public transit",
    "rideshare",
    "car maintenance",
  ],
  food: ["groceries", "dining out", "coffee", "lunch"],
  health: [
    "health insurance",
    "gym",
    "prescriptions",
    "doctor copay",
    "therapy",
  ],
  financial: [
    "credit card payment",
    "student loan",
    "personal loan",
    "savings",
    "investments",
  ],
  personal: [
    "subscription services",
    "streaming",
    "clothing",
    "haircut",
    "pet care",
    // common streaming service names
    "netflix",
    "hulu",
    "prime video",
    "disney+",
    "hbo max",
    "apple tv+",
  ],
};

const keywordMap = Object.entries(BILL_CATEGORIES).reduce(
  (acc, [category, keywords]) => {
    keywords.forEach((word) => (acc[word.toLowerCase()] = category));
    return acc;
  },
  {},
);

const inferCategory = (name) => {
  const normalized = name.toLowerCase().trim();

  // Check for direct keyword matches within the name
  // e.g., "Brooklyn Rent" contains "rent" -> "housing"
  const match = Object.keys(keywordMap).find((keyword) =>
    keyword.includes(normalized),
  );

  return match ? keywordMap[match] : "uncategorized";
};

export default inferCategory;
