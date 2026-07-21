// index.tsx — Рефакторинг живого коду #5
// Перемикач До (inline onSelect) / Після (useCallback) —
// натисни "Клік" кілька разів і подивись на "ExpensiveList render #".

import React, { useState } from "react";
import { BeforeParent } from "./BeforeParent";
import { AfterParent } from "./AfterParent";

const TABS = [
  { id: "before", label: "До (inline onSelect)" },
  { id: "after", label: "Після (useCallback)" },
] as const;

export default function Demo() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("before");

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 420 }}>
      <h2>Зайві ре-рендери → useCallback</h2>
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

      {active === "before" ? <BeforeParent /> : <AfterParent />}

      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        В "До" ExpensiveList render # росте разом з count. В "Після" -
        застигає на 1, бо onSelect більше не створюється заново щоразу.
      </p>
    </div>
  );
}
