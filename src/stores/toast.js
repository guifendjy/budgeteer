import { v4 as uniqueId } from "uuid";

export default function () {
  return {
    toasts: [],
    add(message, type = "info") {
      const id = `toast_${uniqueId()}`;
      const newToast = { id, message, type };

      this.toasts = [...this.toasts, newToast];

      // Auto-remove after 2 seconds
      setTimeout(() => {
        this.remove(id);
      }, 5500);
    },

    remove(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
  };
}
