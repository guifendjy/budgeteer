import { db } from "./db";

export const PersistenceService = {
  /**
   * Generic Save Route
   * Switches between IndexedDB (Free) and eventual API (Pro)
   */
  async save(storeName, data) {
    return await db[storeName].put(data);
  },
  /**
   * Removes a specific record from the store
   */
  async delete(storeName, id) {
    // IndexedDB: Targeted deletion by Primary Key
    return await db[storeName].delete(id);
  },

  async loadAllBills(ownerId) {
    return await db.bills.where("owner_id").equals(ownerId).toArray();
  },

  async loadBudget(userId) {
    return await db.budget.where("userId").equals(userId).first();
  },
};
