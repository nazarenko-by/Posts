// WidthReadout.tsx — UI-компонент, споживає useWindowWidth і показує
// поточну ширину + зону (типове використання значення з хука).

import React from "react";
import useWindowWidth from "./useWindowWidth";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89",
  orange: "#ff9e64", accent: "#7dcfff", green: "#9ece6a",
};
const MONO = "'JetBrains Mono','Fira Code',monospace";

const ZONES = [
  { name: "Mobile", icon: "📱", max: 640, color: C.orange },
  { name: "Tablet", icon: "💻", max: 1024, color: C.accent },
  { name: "Desktop", icon: "🖥️", max: Infinity, color: C.green },
];

function zoneFor(width: number) {
  return ZONES.find((z) => width <= z.max) || ZONES[ZONES.length - 1];
}

export default function WidthReadout() {
  const width = useWindowWidth();
  const zone = zoneFor(width);

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: MONO,
        padding: 24,
        borderRadius: 12,
        maxWidth: 420,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>useWindowWidth</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
        Зміни розмір вікна браузера - значення нижче оновлюється саме.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 12,
        }}
      >
        <span style={{ color: C.muted, fontSize: 14 }}>{"width:"}</span>
        <span style={{ color: zone.color, fontSize: 24, fontWeight: 700 }}>
          {`${width}px`}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: `${zone.color}1a`,
          border: `1px solid ${zone.color}55`,
          borderRadius: 8,
          padding: "10px 16px",
        }}
      >
        <span style={{ fontSize: 18 }}>{zone.icon}</span>
        <span style={{ color: zone.color, fontSize: 15, fontWeight: 700 }}>{zone.name}</span>
      </div>
    </div>
  );
}
