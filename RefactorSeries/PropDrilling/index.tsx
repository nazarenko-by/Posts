// index.tsx — Рефакторинг живого коду #3
// Перемикач До (prop drilling) / Після (composition-слот).

import React, { useState } from "react";
import { BeforeApp } from "./BeforeApp";
import { AfterApp } from "./AfterApp";

const TABS = [
  { id: "before", label: "До (prop drilling)" },
  { id: "after", label: "Після (composition)" },
] as const;

export default function Demo() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("before");

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 460 }}>
      <h2>God-компонент → composition-слот</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{ fontWeight: active === t.id ? 700 : 400 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
        {active === "before" ? <BeforeApp /> : <AfterApp />}
      </div>

      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        В обох версіях результат на екрані однаковий. Різниця — у тому,
        скільки компонентів по дорозі знають про "user", якого не показують.
      </p>
    </div>
  );
}
