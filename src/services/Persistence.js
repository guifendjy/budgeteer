import { db } from "./db";

export const PersistenceService = {
  /**
   * Generic Save Route
   * Switches between IndexedDB (Free) and eventual API (Pro)
   */
  async save(storeName, data, tier = "free") {
    // We'll pull the tier from our store later,
    // but the logic remains: route based on tier.
    const isPro = tier == "pro";

    if (isPro) {
      // return await ApiClient.put(`/${storeName}`, data);
    }

    // Default: IndexedDB => free tier
    return await db[storeName].put(data);
  },
  /**
   * Removes a specific record from the store
   */
  async delete(storeName, id) {
    const isPro = false; // Tier check

    if (isPro) {
      // await ApiClient.delete(`/${storeName}/${id}`);
    }

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
