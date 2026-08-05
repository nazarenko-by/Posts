// index.tsx — Node/Backend #1
// Клікабельна версія RestApiViz: вибираєш маршрут - демо реально викликає
// handleRequest() з server.ts і показує анатомію запиту/відповіді.
// Текст 14px+ по всьому демо (компонент рендериться до ~600px висоти).

import React, { useState } from "react";
import { ROUTES, handleRequest } from "./server";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  muted: "#8a93c7", text: "#c0caf5", red: "#ff5f57",
};

export default function Demo() {
  const [selected, setSelected] = useState(0);
  const route = ROUTES[selected];
  const response = handleRequest(route.method, route.path);

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      background: C.bg, color: C.text,
      padding: 24, maxWidth: 560,
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>REST API - анатомія запиту</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {ROUTES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setSelected(i)}
            style={{
              padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer",
              fontFamily: "inherit",
              background: i === selected ? C.accent + "22" : "transparent",
              border: `1px solid ${i === selected ? C.accent : C.border}`,
              color: i === selected ? C.accent : C.muted,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{
          flex: 1, minWidth: 220, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: 16,
        }}>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// запит"}</div>
          <div style={{ fontSize: 15, color: C.green, fontWeight: 700, marginBottom: 4 }}>{route.method}</div>
          <div style={{ fontSize: 15, color: C.accent, marginBottom: 8 }}>{route.path}</div>
          <div style={{ fontSize: 14, color: C.purple }}>{"Accept: application/json"}</div>
        </div>

        <div style={{
          flex: 1, minWidth: 220, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: 16,
        }}>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// відповідь"}</div>
          <div style={{
            fontSize: 15, fontWeight: 700, marginBottom: 8,
            color: response.status < 300 ? C.green : C.red,
          }}>
            {response.status}{" "}{response.status < 300 ? "OK" : "Error"}
          </div>
          <pre style={{
            fontSize: 14, color: C.text, whiteSpace: "pre-wrap",
            margin: 0, fontFamily: "inherit",
          }}>
            {JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      </div>

      <p style={{ marginTop: 16, color: C.muted, fontSize: 14 }}>
        Кожен клік реально викликає handleRequest() з server.ts - той самий route table,
        що і на слайді з візуалізацією, тільки цього разу клікабельний.
      </p>
    </div>
  );
}
