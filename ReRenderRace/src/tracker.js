// Лічильник ре-рендерів поза React: компоненти пишуть сюди в useLayoutEffect
// (раз на кожен закомічений рендер), панель лічильників читає через useSyncExternalStore.
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";

const counts = { context: {}, zustand: {}, redux: {} };
let armed = false; // рахуємо лише після першого монтування
let version = 0;
const listeners = new Set();

const emit = () => { version++; listeners.forEach((l) => l()); };

export function arm() { armed = true; }
export function reset() {
  for (const v of Object.keys(counts)) counts[v] = {};
  emit();
}
export const totals = () => Object.fromEntries(
  Object.entries(counts).map(([v, c]) => [v, Object.values(c).reduce((a, b) => a + b, 0)]),
);
export const detail = () => JSON.parse(JSON.stringify(counts));

export function useTotals() {
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => version);
  return totals();
}

// хук для кожного компонента дерева: рахує рендер і «підсвічує» вузол
export function useTrack(variant, name) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!armed) return;
    counts[variant][name] = (counts[variant][name] ?? 0) + 1;
    const el = ref.current;
    if (el && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.remove("flash");
      void el.offsetWidth; // перезапуск CSS-анімації
      el.classList.add("flash");
    }
    queueMicrotask(emit);
  });
  return ref;
}
