import Dexie from "dexie";

// Initialize the Database
export const db = new Dexie("ArchitectBudgetDB");

/**
 * DATABASE SCHEMA VERSION 1
 * -------------------------
 * bills: Primary key is 'id'. We index 'due_date' for chronological sweeps
 *        and 'owner_id' for multi-tier data scoping.
 * budget: Primary key is 'userId'. Since there's usually one budget per user,
 *         this acts as a single-record store.
 * user: Primary key is 'id'. Stores the identity root and settings.
 */
db.version(1).stores({
  bills: "id, due_date, status, category, owner_id",
  budget: "userId",
  user: "id",
});

// Helper to clear everything (Useful for testing or "Reset Data" feature)
export const resetDatabase = async () => {
  await db.bills.clear();
  await db.budget.clear();
  await db.user.clear();
};
