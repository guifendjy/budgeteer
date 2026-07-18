export default function () {
  return {
    openPanel: null,
    setPanel(panel) {
      this.openPanel = panel;
    },
    closePanel() {
      this.openPanel = null;
    },
  };
}
