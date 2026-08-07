// index.tsx — Node/Backend #2 (Request lifecycle)
// Перемикач "без validate()" / "з validate()" + вибір body (валідний / без name).
// Показує реальну різницю: сирий handler падає, з validate() - акуратна 400.
// Текст 14px+ по всьому демо (компонент рендериться до ~600px висоти).

import React, { useState } from "react";
import { handleNaive, handleWithValidation } from "./server";
import { Body } from "./types";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  muted: "#8a93c7", text: "#c0caf5", red: "#ff5f57", teal: "#1abc9c",
};

const BODIES: { label: string; body: Body }[] = [
  { label: '{ "name": "Ann" }', body: { name: "Ann" } },
  { label: "{ } (без name)", body: {} },
];

export default function Demo() {
  const [validated, setValidated] = useState(false);
  const [bodyIndex, setBodyIndex] = useState(0);

  const body = BODIES[bodyIndex].body;
  const result = validated ? handleWithValidation(body) : handleNaive(body);

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      background: C.bg, color: C.text,
      padding: 24, maxWidth: 560,
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Request lifecycle — з validate() чи без</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setValidated(false)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer",
            fontFamily: "inherit",
            background: !validated ? C.red + "22" : "transparent",
            border: `1px solid ${!validated ? C.red : C.border}`,
            color: !validated ? C.red : C.muted,
          }}
        >
          Без validate()
        </button>
        <button
          onClick={() => setValidated(true)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer",
            fontFamily: "inherit",
            background: validated ? C.teal + "22" : "transparent",
            border: `1px solid ${validated ? C.teal : C.border}`,
            color: validated ? C.teal : C.muted,
          }}
        >
          З validate()
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {BODIES.map((b, i) => (
          <button
            key={b.label}
            onClick={() => setBodyIndex(i)}
            style={{
              padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer",
              fontFamily: "inherit",
              background: i === bodyIndex ? C.accent + "22" : "transparent",
              border: `1px solid ${i === bodyIndex ? C.accent : C.border}`,
              color: i === bodyIndex ? C.accent : C.muted,
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// POST /api/users"}</div>
        {result.crashed ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.red, marginBottom: 6 }}>
              💥 Сервер впав
            </div>
            <pre style={{ fontSize: 14, color: C.red, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
              {result.message}
            </pre>
          </>
        ) : (
          <>
            <div style={{
              fontSize: 15, fontWeight: 700, marginBottom: 6,
              color: result.status < 300 ? C.green : C.teal,
            }}>
              {result.status}{" "}{result.status < 300 ? "Created" : "Bad Request"}
            </div>
            <pre style={{ fontSize: 14, color: C.text, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
              {JSON.stringify(result.body, null, 2)}
            </pre>
          </>
        )}
      </div>

      <p style={{ marginTop: 16, color: C.muted, fontSize: 14 }}>
        "Без validate()" + порожній body — це реальна помилка, яку кине Node на{" "}
        <code>undefined.trim()</code>. "З validate()" той самий кейс повертає акуратну 400-відповідь.
      </p>
    </div>
  );
}
