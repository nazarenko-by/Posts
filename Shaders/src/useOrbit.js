import { useEffect, useState } from "react";

// Позиція кола, що повільно «плаває» по hero. Пропси шейдерів оновлюються
// на наступному кадрі без перекомпіляції - тож можна просто міняти state.
// Поважаємо prefers-reduced-motion: тоді коло стоїть на місці.
export function useOrbit() {
  const [center, setCenter] = useState({ x: 0.65, y: 0.5 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = (now - start) / 1000;
      setCenter({ x: 0.5 + Math.sin(t * 0.6) * 0.25, y: 0.5 + Math.cos(t * 0.45) * 0.12 });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return center;
}
