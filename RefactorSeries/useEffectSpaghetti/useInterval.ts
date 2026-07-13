// useInterval.ts — Рефакторинг живого коду #2
// Класичний реюзабельний хук-таймер (патерн Дена Абрамова):
// callback завжди актуальний через ref, без stale closure.

import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
