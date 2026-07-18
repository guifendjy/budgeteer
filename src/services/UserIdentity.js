import { db } from "./db";
import { v4 as uniId } from "uuid";

export const UserIdentityService = {
  /**
   * Retrieves the local user or creates a new anonymous one.
   * This ID is the "Identity Root" for all other data.
   */
  async CreateLocalUser() {
    try {
      // Check for existing user in IndexedDB
      let user = await db.user.toCollection().first();

      if (!user) {
        // Generate a fresh local identity
        user = {
          id: `user_local_${uniId()}`,
          tier: "free", // Defaults to Free
          settings: {
            currency: "USD",
            theme: "dark",
            //threshold: 50, // The "Danger Zone" dollar amount
          },
          created_at: new Date().toISOString(),
        };

        await db.user.add(user);
        console.log("[Identity] New Local Identity Root Generated:", user.id);
      }

      return user;
    } catch (error) {
      console.error("[Identity] Failed to resolve user identity:", error);
      throw error;
    }
  },

  async exists() {
    return (await db.user.toCollection().first()) || null;
  },

  /**
   * Updates local user settings/settings
   */
  async updateUserSettings(userId, updates) {
    // best use the user id instead
    const user = await this.exists();
    return await db.user.update(user.id, {
      settings: { ...user.settings, ...updates },
      last_active: new Date().toISOString(),
    });
  },

  // this delete the user data will then go back to onboarding view
  async purgeAllData() {
    console.warn("[Identity] Initiating full data purge...");

    try {
      // 1. Clear all IndexedDB tables
      await Promise.all([db.bills.clear(), db.budget.clear(), db.user.clear()]);

      console.log("[Identity] Data purge complete.");
      return true;
    } catch (error) {
      console.error("[Identity] Purge failed:", error);
      return false;
    }
  },
};
