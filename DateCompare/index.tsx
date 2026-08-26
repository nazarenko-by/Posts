// index.tsx — пост 164, клікабельне демо
// Три кнопки (Date / moment.js / date-fns) - кожна "додає 7 днів" і показує,
// чи змінився оригінал. Прев'ю рендериться до ~600px, тексти 14px+.

import React, { useState } from "react";
import { LIBS } from "./types";
import { runLib } from "./dates";
import type { LibId, RunResult } from "./types";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  accent: "#bb9af7", green: "#9ece6a", red: "#ff5f57",
  muted: "#565f89", text: "#c0caf5",
};
const MONO = "'JetBrains Mono','Fira Code',monospace";

const SOURCE_DATE = new Date("2026-08-20T00:00:00.000Z");

export default function DateLibDemo() {
  const [active, setActive] = useState<LibId | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  function handleRun(lib: LibId) {
    setActive(lib);
    setResult(runLib(lib, SOURCE_DATE));
  }

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: MONO,
        padding: 24,
        borderRadius: 12,
        maxWidth: 480,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ fontSize: 18, margin: "0 0 6px", color: C.text }}>
        Хто мутує дату?
      </h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
        Тиснеш кнопку - додаємо 7 днів і дивимось, чи змінився original.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {LIBS.map((lib) => (
          <button
            key={lib.id}
            onClick={() => handleRun(lib.id)}
            style={{
              flex: "1 1 auto",
              minWidth: 120,
              padding: "10px 14px",
              borderRadius: 8,
              border: `1.5px solid ${active === lib.id ? C.accent : C.border}`,
              background: active === lib.id ? "rgba(187,154,247,0.15)" : C.surface,
              color: active === lib.id ? C.accent : C.text,
              fontFamily: MONO,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {lib.label}
          </button>
        ))}
      </div>

      {result && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "16px 18px",
          }}
        >
          <Row label="original до" value={result.originalBefore} color={C.muted} />
          <Row
            label="original після"
            value={result.originalAfter}
            color={result.mutated ? C.red : C.green}
          />
          <Row label="deadline" value={result.deadline} color={C.text} />

          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 8,
              textAlign: "center",
              fontSize: 15,
              fontWeight: 700,
              background: result.mutated
                ? "rgba(255,95,87,0.12)"
                : "rgba(158,206,106,0.12)",
              color: result.mutated ? C.red : C.green,
            }}
          >
            {result.mutated
              ? "✗ original змінився - мутація!"
              : "✓ original не змінився"}
          </div>
        </div>
      )}

      {!result && (
        <p style={{ fontSize: 14, color: C.muted, textAlign: "center" }}>
          Обери бібліотеку вище ↑
        </p>
      )}
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
        fontSize: 15,
      }}
    >
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
