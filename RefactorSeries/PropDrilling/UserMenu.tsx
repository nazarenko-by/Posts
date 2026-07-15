// UserMenu.tsx — Рефакторинг живого коду #3
// Єдиний реальний споживач "user" в усьому дереві.

import React from "react";
import { User } from "./types";

export function UserMenu({ user }: { user: User }) {
  return (
    <span style={{ color: "#7dcfff" }}>
      {user.name} ({user.role})
    </span>
  );
}
