export default function editMode() {
  return {
    isEditing: false,
    activeField: null,
    activeFieldValue: null,
    timerId: null,
    setActiveField(fieldName, onSave) {
      this.isEditing = !this.isEditing;
      if (this.isEditing) {
        this.activeField = fieldName;
      } else {
        // saving here
        if (typeof onSave === "function") {
          if (this.activeFieldValue) {
            onSave(this.activeFieldValue);
          }
        }
        this.exitEditingMode();
      }
      // auto remove active field after 10s
      if (this.timerId) {
        clearTimeout(this.timerId);
        return;
      }
      this.timerId = setTimeout(() => {
        this.exitEditingMode();
        this.timerId = null;
      }, 1000 * 10);
    },
    exitEditingMode() {
      this.isEditing = false;
      this.activeField = null;
    },
  };
}
