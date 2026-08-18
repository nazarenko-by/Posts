// index.tsx — ✨ Лайфхаки #162
// Дві кнопки поруч: JS-версія (реальний useState + onMouseEnter/Leave,
// лічильник ре-рендерів росте на кожен наведення) і CSS-версія (:hover +
// transition, 0 JS, 0 ре-рендерів - перевіряй наведенням миші).
// Текст 14px+ по всьому демо (компонент рендериться до ~600px висоти).

import React, { useState } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  accent: "#7dcfff", muted: "#8a93c7", text: "#c0caf5",
  red: "#ff5f57", green: "#9ece6a",
};

function JSButton() {
  const [hover, setHover] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  const handleEnter = () => {
    setHover(true);
    setRenderCount((n) => n + 1);
  };
  const handleLeave = () => {
    setHover(false);
    setRenderCount((n) => n + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <button
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          padding: "14px 28px", fontSize: 15, fontWeight: 700, fontFamily: "inherit",
          cursor: "pointer", borderRadius: 10,
          background: C.red + "22", border: `1.5px solid ${C.red}`, color: C.red,
          transform: hover ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.05s linear", // навмисно "наївний" - імітує ручний JS-підхід
        }}
      >
        {"З JS"}
      </button>
      <div style={{ fontSize: 14, color: C.muted }}>
        {"ре-рендерів: "}<span style={{ color: C.red, fontWeight: 700 }}>{renderCount}</span>
      </div>
    </div>
  );
}

function CSSButton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <button className="css-hover-btn" style={{ padding: "14px 28px", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
        {"Тільки CSS"}
      </button>
      <div style={{ fontSize: 14, color: C.muted }}>
        {"ре-рендерів: "}<span style={{ color: C.green, fontWeight: 700 }}>{"0"}</span>
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      background: C.bg, color: C.text,
      padding: 24, maxWidth: 560,
    }}>
      <style>{`
        .css-hover-btn {
          border-radius: 10px;
          background: rgba(158, 206, 106, 0.13);
          border: 1.5px solid ${C.green};
          color: ${C.green};
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .css-hover-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 16px rgba(158, 206, 106, 0.5);
        }
      `}</style>

      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Наведи мишею на обидві кнопки</h2>

      <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 20 }}>
        <JSButton />
        <CSSButton />
      </div>

      <p style={{ color: C.muted, fontSize: 14 }}>
        Ліва кнопка реально викликає useState і ре-рендер компонента на кожен onMouseEnter/onMouseLeave -
        лічильник росте. Права - чистий CSS :hover, той самий візуальний ефект, 0 JS-коду і 0 ре-рендерів.
      </p>
    </div>
  );
}
