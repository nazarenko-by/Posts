// index.tsx — Node/Backend #5 (Prisma)
// Вводиш назву поля вручну (валідне чи з typo) - бачиш різницю:
// сирий SQL мовчки повертає [], типізований client показує явну помилку.
// Текст 14px+ по всьому демо (компонент рендериться до ~600px висоти).

import React, { useState } from "react";
import { rawQuery, USER_FIELDS } from "./db";
import { UserField } from "./db";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  muted: "#8a93c7", text: "#c0caf5", red: "#ff5f57", teal: "#1abc9c",
};

const FIELD_OPTIONS = ["email", "emial"]; // валідне поле і typo

export default function Demo() {
  const [field, setField] = useState("email");
  const isValid = (USER_FIELDS as readonly string[]).includes(field);

  const raw = rawQuery(field, "ann@example.com");
  const typedError = !isValid
    ? `Type error: "${field}" не існує у типі User (email | id | name)`
    : null;

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      background: C.bg, color: C.text,
      padding: 24, maxWidth: 560,
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Сирий SQL vs типізований client</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {FIELD_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setField(f)}
            style={{
              padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
              background: field === f ? C.accent + "22" : "transparent",
              border: `1px solid ${field === f ? C.accent : C.border}`,
              color: field === f ? C.accent : C.muted,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16, marginBottom: 14,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>
          {"// pool.query(\"SELECT * FROM users WHERE "}{field}{" = $1\")"}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: raw.rows.length > 0 ? C.green : C.red }}>
          {raw.rows.length > 0 ? `✓ знайдено ${raw.rows.length} рядок(ів)` : "[] - порожньо, без помилки"}
        </div>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>
          {"// prisma.user.findUnique({ where: { "}{field}{": ... } })"}
        </div>
        {typedError ? (
          <div style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{"✗ "}{typedError}</div>
        ) : (
          <div style={{ fontSize: 15, fontWeight: 700, color: C.teal }}>{"✓ поле валідне, компілюється"}</div>
        )}
      </div>

      <p style={{ marginTop: 16, color: C.muted, fontSize: 14 }}>
        "email" - усе працює однаково в обох підходах. "emial" (typo) - сирий SQL мовчки повертає
        [], а типізований client не дає навіть скомпілювати такий запит.
      </p>
    </div>
  );
}
