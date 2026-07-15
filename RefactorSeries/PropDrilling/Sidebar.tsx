// Sidebar.tsx — Рефакторинг живого коду #3
// Незалежний від user компонент — у виправленій версії взагалі не знає про нього.

import React from "react";

export function Sidebar() {
  return (
    <aside style={{ padding: 8, borderRight: "1px solid #2a2c4a", fontSize: 13, color: "#565f89" }}>
      Sidebar (не залежить від user)
    </aside>
  );
}
