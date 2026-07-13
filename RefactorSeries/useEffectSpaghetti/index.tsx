// index.tsx — Рефакторинг живого коду #2
// Композиція п'яти хуків у живий Dashboard — те, що раніше було
// п'ятьма переплутаними useEffect в одному компоненті.

import React, { useState } from "react";
import { useDashboardData } from "./useDashboardData";
import { useWebSocket } from "./useWebSocket";
import { useInterval } from "./useInterval";
import { useWindowSize } from "./useWindowSize";
import { useDocumentTitle } from "./useDocumentTitle";

function Dashboard() {
  const data = useDashboardData();
  const messages = useWebSocket("wss://example.com/events");
  const { width } = useWindowSize();
  const [ticks, setTicks] = useState(0);

  useInterval(() => setTicks((t) => t + 1), 1000);
  useDocumentTitle(`Dashboard (${messages.length})`);

  return (
    <div style={{ padding: 16, border: "1px solid #2a2c4a", borderRadius: 8 }}>
      <p style={{ margin: "4px 0" }}>
        Дані: {data ? `${data.visitors} відвідувачів, ${data.errors} помилок` : "завантаження..."}
      </p>
      <p style={{ margin: "4px 0" }}>Ширина вікна: {width}px</p>
      <p style={{ margin: "4px 0" }}>Тіки таймера: {ticks}</p>
      <p style={{ margin: "4px 0" }}>
        Останні події: {messages.length ? messages.join(", ") : "очікування..."}
      </p>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 460 }}>
      <h2>useEffect-спагеті → 5 іменованих хуків</h2>
      <Dashboard />
      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        useDashboardData + useWebSocket + useInterval + useWindowSize + useDocumentTitle —
        кожен хук відповідає за одну річ і читається за назвою.
      </p>
    </div>
  );
}
