// index.tsx — Node/Backend #3 (JWT)
// Decode реального токена (header/payload як звичайний JSON) +
// симуляція alg:none атаки: verifyUnsafe() приймає підроблений токен,
// verifySafe() (явний allowlist algorithms) - відхиляє.
// Текст 14px+ по всьому демо (компонент рендериться до ~600px висоти).

import React, { useState } from "react";
import { issueToken, forgeNoneAlgToken, decode, verifyUnsafe, verifySafe } from "./jwt";
import { JwtPayload } from "./types";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  muted: "#8a93c7", text: "#c0caf5", red: "#ff5f57", teal: "#1abc9c",
};

const PAYLOAD: JwtPayload = { sub: "42", role: "user", exp: 9999999999 };

export default function Demo() {
  const [forged, setForged] = useState(false);
  const [safe, setSafe] = useState(true);

  const token = forged ? forgeNoneAlgToken(PAYLOAD) : issueToken(PAYLOAD);
  const { header, payload } = decode(token);
  const result = safe ? verifySafe(token) : verifyUnsafe(token);

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      background: C.bg, color: C.text,
      padding: 24, maxWidth: 560,
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>JWT — decode і alg:none атака</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => setForged(false)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
            background: !forged ? C.green + "22" : "transparent",
            border: `1px solid ${!forged ? C.green : C.border}`,
            color: !forged ? C.green : C.muted,
          }}
        >
          Справжній токен
        </button>
        <button
          onClick={() => setForged(true)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
            background: forged ? C.red + "22" : "transparent",
            border: `1px solid ${forged ? C.red : C.border}`,
            color: forged ? C.red : C.muted,
          }}
        >
          Підроблений (alg: none)
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setSafe(false)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
            background: !safe ? C.orange + "22" : "transparent",
            border: `1px solid ${!safe ? C.red : C.border}`,
            color: !safe ? C.red : C.muted,
          }}
        >
          verifyUnsafe()
        </button>
        <button
          onClick={() => setSafe(true)}
          style={{
            padding: "8px 14px", fontSize: 14, borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
            background: safe ? C.teal + "22" : "transparent",
            border: `1px solid ${safe ? C.teal : C.border}`,
            color: safe ? C.teal : C.muted,
          }}
        >
          verifySafe()
        </button>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16, marginBottom: 14,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// header.payload.signature"}</div>
        <pre style={{ fontSize: 14, color: C.text, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
          {token}
        </pre>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16, marginBottom: 14,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// decode() - без жодної перевірки"}</div>
        <pre style={{ fontSize: 14, color: C.accent, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
          {JSON.stringify({ header, payload }, null, 2)}
        </pre>
      </div>

      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 16,
      }}>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{"// verify"}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: result.ok ? C.green : C.red }}>
          {result.ok ? "✓ прийнято" : `✗ відхилено: ${result.reason}`}
        </div>
      </div>

      <p style={{ marginTop: 16, color: C.muted, fontSize: 14 }}>
        Обери "Підроблений" + "verifyUnsafe()" - токен без підпису пройде. Той самий токен з
        "verifySafe()" (явний allowlist algorithms) - відхиляється.
      </p>
    </div>
  );
}
