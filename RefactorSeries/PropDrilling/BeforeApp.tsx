// BeforeApp.tsx — Рефакторинг живого коду #3
// "Багована" версія: user проходить через Layout і Sidebar до Header,
// хоча жоден з них сам його не використовує. Локальні drill-версії
// компонентів — тільки для демонстрації антипатерну.

import React from "react";
import { useUser } from "./useUser";
import { UserMenu } from "./UserMenu";
import { User } from "./types";

function LayoutDrill({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <SidebarDrill user={user} />
      {children}
    </div>
  );
}

function SidebarDrill({ user }: { user: User }) {
  // приймає user, але сам його не показує — просто мертвий вантаж
  return (
    <aside style={{ padding: 8, borderRight: "1px solid #2a2c4a", fontSize: 13, color: "#565f89" }}>
      Sidebar (отримує user, але не використовує)
    </aside>
  );
}

function HeaderDrill({ user }: { user: User }) {
  return (
    <header style={{ padding: 8, borderBottom: "1px solid #2a2c4a", flex: 1 }}>
      <UserMenu user={user} />
    </header>
  );
}

export function BeforeApp() {
  const user = useUser();
  return (
    <LayoutDrill user={user}>
      <HeaderDrill user={user} />
    </LayoutDrill>
  );
}
