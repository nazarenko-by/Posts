// AfterApp.tsx — Рефакторинг живого коду #3
// Composition-слот: Layout і Header нейтральні, user потрапляє
// одразу в UserMenu, Sidebar взагалі не бере участі в передачі.

import React from "react";
import { useUser } from "./useUser";
import { Layout } from "./Layout";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

export function AfterApp() {
  const user = useUser();
  return (
    <Layout>
      <Sidebar />
      <Header>
        <UserMenu user={user} />
      </Header>
    </Layout>
  );
}
