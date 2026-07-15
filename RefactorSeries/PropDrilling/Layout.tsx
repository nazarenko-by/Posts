// Layout.tsx — Рефакторинг живого коду #3
// Нейтральна обгортка: не знає що таке "user", просто рендерить children.

import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 8 }}>{children}</div>;
}
