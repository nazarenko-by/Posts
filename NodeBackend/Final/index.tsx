// index.tsx — Node/Backend Фінал 6/6 (капстоун)
// Клікабельний прогін усього ланцюжка серії: request -> authenticate (#3) ->
// prisma include (#4/#5) -> response. Перемикач валідний/невалідний токен.
// Текст 14px+ по всьому демо (компонент рендериться до ~600px висоти).

import React, { useState } from "react";
import { runPipeline } from "./pipeline";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  muted: "#8a93c7", text: "#c0caf5", red: "#ff5f57", teal: "#1abc9c",
};

export default function Demo() {
  const [validToken, setValidToken] = useState(true);
  const result = runPipeline(validToken ? "valid-token" : "wrong-token");

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      background: C.bg, color: C.text,
      padding: 24, maxWidth: 560,
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Капстоун — весь ланцюжок серії в одному маршруті</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setValidToken(true)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
            background: validToken ? C.teal + "22" : "transparent",
            border: `1px solid ${validToken ? C.teal : C.border}`,
            color: validToken ? C.teal : C.muted,
          }}
        >
          Валідний токен
        </button>
        <button
          onClick={() => setValidToken(false)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
            background: !validToken ? C.red + "22" : "transparent",
            border: `1px solid ${!validToken ? C.red : C.border}`,
            color: !validToken ? C.red : C.muted,
          }}
        >
          Невалідний токен
        </button>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16, marginBottom: 14,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// кроки пайплайна"}</div>
        {result.steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: s.ok ? C.green : C.red, fontSize: 14 }}>{s.ok ? "✓" : "✗"}</span>
            <span style={{ color: C.accent, fontSize: 14, fontWeight: 700 }}>{s.step}</span>
            <span style={{ color: C.muted, fontSize: 14 }}>{s.detail}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// відповідь"}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: result.status < 300 ? C.green : C.red, marginBottom: 6 }}>
          {result.status}
        </div>
        <pre style={{ fontSize: 14, color: C.text, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
          {JSON.stringify(result.body, null, 2)}
        </pre>
      </div>

      <p style={{ marginTop: 16, color: C.muted, fontSize: 14 }}>
        Один маршрут - і всі п'ять епізодів серії реально відпрацьовують у ньому:
        request lifecycle, JWT-перевірка, і include замість N+1.
      </p>
    </div>
  );
}
