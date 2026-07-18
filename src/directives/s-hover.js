import { default as observer } from "../utils/observer";

export default function sHoverPlugin({ el, execute, expression }) {
  if (!el._hasObserver) {
    observer.register({
      element: el,
      onMount(target) {
        const handler = () => execute(expression);
        target.addEventListener("mouseenter", handler);
        target.addEventListener("mouseleave", handler);
        return () => {
          target.removeEventListener("mouseenter", handler);
          target.removeEventListener("mouseleave", handler);
          target._hasObserver = false;
        };
      },
    });
    el._hasObserver = true;
  }
}
