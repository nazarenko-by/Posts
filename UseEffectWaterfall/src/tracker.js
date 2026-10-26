// Лічильник комітів поза React. Кожен закомічений рендер панелі записується сюди
// разом з ознакою «узгоджено»: чи збігаються на екрані запит, список і лічильник.
import { useLayoutEffect, useSyncExternalStore } from "react";

const stats = { effect: { renders: 0, stale: 0 }, render: { renders: 0, stale: 0 } };
let armed = false;
let version = 0;
const listeners = new Set();
const emit = () => { version++; listeners.forEach((l) => l()); };

export const arm = () => { armed = true; };
export function reset() {
  for (const k of Object.keys(stats)) stats[k] = { renders: 0, stale: 0 };
  emit();
}
export const snapshot = () => JSON.parse(JSON.stringify(stats));

export function useStats() {
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => version);
  return stats;
}

// consistent - чи відповідає те, що зараз на екрані, поточному запиту
export function useCommit(variant, consistent, ref) {
  useLayoutEffect(() => {
    if (!armed) return;
    stats[variant].renders += 1;
    if (!consistent) stats[variant].stale += 1;
    const el = ref.current;
    if (el && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.remove("flash", "stale");
      void el.offsetWidth;
      el.classList.add(consistent ? "flash" : "stale");
    }
    queueMicrotask(emit);
  });
}
