// index.tsx — Code review #5 (Фінал)
// Той самий чек-лист, що і в CodeReviewFinalViz - інтерактивний, з live-вердиктом.

import React, { useState } from "react";
import { AUTHOR_CHECKLIST, getVerdict } from "./checklist";

export default function Demo() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const verdict = getVerdict(checked);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 460 }}>
      <h2>Чек-лист автора PR</h2>

      <div style={{
        marginBottom: 16, padding: "10px 14px", borderRadius: 8,
        background: verdict.startsWith("✅") ? "#e6f7ec" : verdict.startsWith("🟡") ? "#fff7e6" : "#f3f3f3",
        border: "1px solid #ddd", fontSize: 14, fontWeight: 600,
      }}>
        {verdict}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {AUTHOR_CHECKLIST.map((item) => (
          <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={() => toggle(item.id)}
            />
            {item.text}
          </label>
        ))}
      </div>

      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        Naming (#1), overengineering (#2), edge cases (#3) і чек-лист рев'юера (#4) -
        всі чотири епізоди серії стиснуті в ці 5 пунктів. Пройди їх сам, перш ніж натиснути Request review.
      </p>
    </div>
  );
}
