import { default as observer } from "../utils/observer";

export default function sEffectFocusPlugin({ el }) {
  // use a watcher
  if (!el._hasObserver) {
    observer.register({
      element: el,
      onMount(target) {
        target.focus();
        return () => (target._hasObserver = false);
      },
    });
    el._hasObserver = true;
  }
}
