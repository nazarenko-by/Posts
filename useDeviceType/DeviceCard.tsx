// DeviceCard.tsx — UI-компонент, споживає useDeviceType і показує
// { device, orientation } так, як реально повертає хук.

import React from "react";
import useDeviceType from "./useDeviceType";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89",
  orange: "#ff9e64", accent: "#7dcfff", green: "#9ece6a",
};
const MONO = "'JetBrains Mono','Fira Code',monospace";

const DEVICE_COLOR: Record<string, string> = {
  mobile: C.orange,
  tablet: C.accent,
  desktop: C.green,
};
const DEVICE_ICON: Record<string, string> = {
  mobile: "📱",
  tablet: "📟",
  desktop: "🖥️",
};

export default function DeviceCard() {
  const { device, orientation } = useDeviceType();
  const color = DEVICE_COLOR[device] || C.muted;
  const icon = DEVICE_ICON[device] || "❓";

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
      <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>useDeviceType</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
        Реальний UA твого браузера - зміни розмір вікна щоб оновити.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          background: C.surface,
          border: `1.5px solid ${color}`,
          borderRadius: 10,
          padding: "20px 16px",
        }}
      >
        <div style={{ fontSize: 40 }}>{icon}</div>
        <div
          style={{
            display: "flex",
            gap: 8,
            fontSize: 13,
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "8px 14px",
          }}
        >
          <span style={{ color: C.muted }}>{"{ device:"}</span>
          <span style={{ color, fontWeight: 700 }}>{`"${device}"`}</span>
          <span style={{ color: C.muted }}>{", orientation:"}</span>
          <span style={{ color, fontWeight: 700 }}>{`"${orientation || "-"}"`}</span>
          <span style={{ color: C.muted }}>{" }"}</span>
        </div>
      </div>
    </div>
  );
}
