import { UserIdentityService } from "../services/UserIdentity";

export default function () {
  return {
    id: null, // no id means no user yet.
    // accountName: null, will eventually ask for a name???
    settings: {
      currency: "USD",
      theme: "dark",
      // more settings...
    },
    created_at: Date.now(),
    async updateSettings(newSettings) {
      try {
        if (newSettings.theme) {
          // apply theme
          document
            .querySelector("html")
            .setAttribute("data-theme", newSettings.theme);
        }

        this.settings = { ...this.settings, ...newSettings };
        await UserIdentityService.updateUserSettings(
          this.$store.UserStore.id,
          this.settings,
        );

        // here I could trigger a page refresh instead of forcing through realm signals
        // like budget and bills to show new currency (UI only)
      } catch (error) {
        console.error(error);
        this.$store.ToastStore.add("Error: updating settings", "error");
      }
    },
    async purgeAllData() {
      await UserIdentityService.purgeAllData();
      Location.reload();
    },
    async init() {
      try {
        const user = await UserIdentityService.exists();

        if (!user) return;
        const { created_at, id, settings } = user;
        this.id = id;
        this.settings = settings;
        this.created_at = created_at;

        // apply theme
        document
          .querySelector("html")
          .setAttribute("data-theme", this.settings.theme);
      } catch (error) {
        console.error(
          "Error: critical boot error, user not found, or something wrong happened.",
          error,
        );
        this.$store.ToastStore.add(
          "Critical boot error user not found",
          "error",
        );
      }
    },
  };
}
