// Demo.tsx — Рефакторинг живого коду #4
// Живий перемикач статусу + порівняння "До" (вкладений тернарник)
// і "Після" (STATUS_MAP) — той самий результат, різний код.

import React, { useState } from "react";
import { OrderStatus } from "./types";
import { BeforeOrderStatus } from "./BeforeOrderStatus";
import { AfterOrderStatus } from "./AfterOrderStatus";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "cancelled", "unknown"];

export default function Demo() {
  const [status, setStatus] = useState<OrderStatus>("pending");

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 420 }}>
      <h2>Вкладені тернарники → STATUS_MAP</h2>

      <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <b>До:</b> <BeforeOrderStatus status={status} />
        </div>
        <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <b>Після:</b> <AfterOrderStatus status={status} />
        </div>
      </div>

      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        Обидва компоненти дають однаковий результат для будь-якого статусу —
        різниця лише в тому, наскільки легко додати новий статус чи прочитати логіку.
      </p>
    </div>
  );
}
