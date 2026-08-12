// index.tsx — Node/Backend #4 (N+1)
// Перемикач кількості users (10 / 10 000) x наївний цикл / include -
// реально рахує кількість "запитів до бази" через db.ts.
// Текст 14px+ по всьому демо (компонент рендериться до ~600px висоти).

import React, { useState } from "react";
import { naiveFetch, includeFetch, getLog } from "./db";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  muted: "#8a93c7", text: "#c0caf5", red: "#ff5f57", teal: "#1abc9c", orange: "#ff9e64",
};

const USER_COUNTS = [10, 10000];

export default function Demo() {
  const [userCount, setUserCount] = useState(10);
  const [useInclude, setUseInclude] = useState(false);

  const stats = useInclude ? includeFetch(userCount) : naiveFetch(userCount);
  const log = getLog();

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      background: C.bg, color: C.text,
      padding: 24, maxWidth: 560,
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>N+1 — наївний цикл vs include</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {USER_COUNTS.map((c) => (
          <button
            key={c}
            onClick={() => setUserCount(c)}
            style={{
              padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
              background: userCount === c ? C.accent + "22" : "transparent",
              border: `1px solid ${userCount === c ? C.accent : C.border}`,
              color: userCount === c ? C.accent : C.muted,
            }}
          >
            {c.toLocaleString()} users
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setUseInclude(false)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
            background: !useInclude ? C.red + "22" : "transparent",
            border: `1px solid ${!useInclude ? C.red : C.border}`,
            color: !useInclude ? C.red : C.muted,
          }}
        >
          Наївний цикл
        </button>
        <button
          onClick={() => setUseInclude(true)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
            background: useInclude ? C.teal + "22" : "transparent",
            border: `1px solid ${useInclude ? C.teal : C.border}`,
            color: useInclude ? C.teal : C.muted,
          }}
        >
          include
        </button>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16, marginBottom: 14,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// результат"}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: stats.queryCount > 100 ? C.red : C.green, marginBottom: 4 }}>
          {stats.queryCount.toLocaleString()} {"запит(ів)"}
        </div>
        <div style={{ fontSize: 14, color: C.orange }}>
          {"~"}{stats.timeMs.toFixed(1)}{"ms"}
        </div>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16, maxHeight: 160, overflow: "auto",
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// лог запитів (перші рядки)"}</div>
        {log.slice(0, 6).map((l, i) => (
          <div key={i} style={{ fontSize: 14, color: C.text, marginBottom: 2 }}>{l}</div>
        ))}
        {log.length > 6 && (
          <div style={{ fontSize: 14, color: C.muted }}>{"... і ще "}{log.length - 6}{" запит(ів)"}</div>
        )}
      </div>

      <p style={{ marginTop: 16, color: C.muted, fontSize: 14 }}>
        При 10 users різниця непомітна. При 10 000 - наївний цикл робить 10 001 реальний запит,
        include - завжди один, незалежно від кількості users.
      </p>
    </div>
  );
}
