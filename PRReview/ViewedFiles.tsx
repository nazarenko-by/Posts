// ViewedFiles.tsx — Пост 140: GitHub PR review
// Живий мокап чекбоксів "Viewed": позначені файли гаснуть,
// фокус лишається на тому, що ще не перевірено.

import React, { useState } from "react";

const FILES = ["OrderStatus.tsx", "useProducts.ts", "Layout.tsx", "Demo.test.ts"];

export function ViewedFiles() {
  const [viewed, setViewed] = useState<Record<string, boolean>>({});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {FILES.map((f) => (
        <label
          key={f}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #2a2c4a",
            opacity: viewed[f] ? 0.5 : 1,
          }}
        >
          <input
            type="checkbox"
            checked={!!viewed[f]}
            onChange={(e) => setViewed((v) => ({ ...v, [f]: e.target.checked }))}
          />
          <span style={{ textDecoration: viewed[f] ? "line-through" : "none" }}>{f}</span>
          {viewed[f] && <span style={{ marginLeft: "auto", fontSize: 12, color: "#565f89" }}>Viewed</span>}
        </label>
      ))}
    </div>
  );
}
