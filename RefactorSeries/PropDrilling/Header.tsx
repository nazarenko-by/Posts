// Header.tsx — Рефакторинг живого коду #3
// Теж нейтральна обгортка — приймає готовий children (напр. <UserMenu />).

import React from "react";

export function Header({ children }: { children: React.ReactNode }) {
  return (
    <header style={{ padding: 8, borderBottom: "1px solid #2a2c4a", flex: 1 }}>
      {children}
    </header>
  );
}
