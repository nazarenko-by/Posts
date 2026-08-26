// index.tsx — пост 170, клікабельне демо
// Справжній useDebounce hook (та сама реалізація що на слайді 2), під'єднаний
// до реального <input>. Лічильники живі: "сирих" onChange викликів і реальних
// debounced-оновлень (500ms). Друкуй у полі і дивись різницю наживо.

import React, { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89", red: "#ff5f57", green: "#9ece6a",
};
const MONO = "'JetBrains Mono','Fira Code',monospace";

// Справжній useDebounce - той самий код, що на слайді 2.
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // cancel on every new value
  }, [value, delay]);

  return debounced;
}

export default function UseDebounceDemo() {
  const [value, setValue] = useState("");
  const [rawCount, setRawCount] = useState(0);
  const [debouncedCount, setDebouncedCount] = useState(0);
  const debounced = useDebounce(value, 500);
  const prevDebounced = useRef(debounced);

  useEffect(() => {
    if (debounced !== prevDebounced.current) {
      setDebouncedCount((n) => n + 1);
      prevDebounced.current = debounced;
    }
  }, [debounced]);

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: MONO,
        padding: 24,
        borderRadius: 12,
        maxWidth: 420,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>useDebounce</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
        Друкуй у полі - лічильники живі, справжній setTimeout/clearTimeout.
      </p>

      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setRawCount((n) => n + 1);
        }}
        placeholder="почни друкувати..."
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 14px",
          borderRadius: 8,
          border: `1.5px solid ${C.border}`,
          background: C.surface,
          color: C.text,
          fontFamily: MONO,
          fontSize: 15,
          marginBottom: 16,
        }}
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            flex: 1,
            background: C.surface,
            border: `1px solid ${C.red}`,
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <div style={{ color: C.red, fontSize: 12, marginBottom: 4 }}>
            {"без debounce"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{rawCount}</div>
        </div>
        <div
          style={{
            flex: 1,
            background: C.surface,
            border: `1px solid ${C.green}`,
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <div style={{ color: C.green, fontSize: 12, marginBottom: 4 }}>
            {"з useDebounce(500ms)"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{debouncedCount}</div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: C.muted }}>
        {"debounced value: "}
        <span style={{ color: C.text }}>{debounced || "—"}</span>
      </div>
    </div>
  );
}
