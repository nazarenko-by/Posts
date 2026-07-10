// demo/ProductFilters.tsx — Рефакторинг живого коду #1
// Один компонент, одна відповідальність: рядок пошуку.

import React from "react";

export function ProductFilters({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Пошук за назвою..."
      style={{
        width: "100%",
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid #2a2c4a",
        background: "#16213e",
        color: "#c0caf5",
        marginBottom: 12,
        boxSizing: "border-box",
      }}
    />
  );
}
