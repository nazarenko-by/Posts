// index.tsx — Code review #4
// Інтерактивний чек-лист: клацай пункти, вердикт зверху рахується наживо.
// Форма PR - першою групою: поки вона не закрита, вердикт не пускає далі,
// так само як в реальному review.

import React, { useState } from "react";
import { CHECKLIST, GROUP_LABELS, getVerdict } from "./checklist";
import { ChecklistGroup } from "./types";

const GROUPS: ChecklistGroup[] = ["form", "readability", "reliability"];

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
      <h2>Чек-лист рев'юера</h2>

      <div style={{
        marginBottom: 16, padding: "10px 14px", borderRadius: 8,
        background: verdict.startsWith("✅") ? "#e6f7ec" : "#fff7e6",
        border: "1px solid #ddd", fontSize: 14, fontWeight: 600,
      }}>
        {verdict}
      </div>

      {GROUPS.map((group) => (
        <div key={group} style={{ marginBottom: 14 }}>
          <b>{GROUP_LABELS[group]}</b>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
            {CHECKLIST.filter((item) => item.group === group).map((item) => (
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
        </div>
      ))}

      <p style={{ marginTop: 12, color: "#888", fontSize: 13 }}>
        Спробуй відзначити тільки "Читабельність" чи "Надійність", не закривши "Форма PR" -
        вердикт все одно попросить розбити PR, бо дешеві перевірки йдуть першими.
      </p>
    </div>
  );
}
