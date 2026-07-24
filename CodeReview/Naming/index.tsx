// index.tsx — Code review #1
// Показує cryptic.ts і readable.ts поруч + результат перевірки
// однакової поведінки (assertSameResult з equivalence.test.ts).

import React, { useMemo } from "react";
import { assertSameResult } from "./equivalence.test";

export default function Demo() {
  const { before, after, equal } = useMemo(() => assertSameResult(), []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 480 }}>
      <h2>Naming і читабельність</h2>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <b>process(d)</b>
          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
{`function process(d) {
  const r = d.filter(x => x.a);
  return r.map(x => x.b * x.c);
}`}
          </pre>
        </div>
        <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <b>calculateActiveOrderTotals(orders)</b>
          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
{`function calculateActiveOrderTotals(orders) {
  const activeOrders = orders.filter(
    (order) => order.isActive
  );
  return activeOrders.map(
    (order) => order.price * order.quantity
  );
}`}
          </pre>
        </div>
      </div>

      <p style={{ marginTop: 16 }}>
        Результат cryptic: <code>{JSON.stringify(before)}</code>
      </p>
      <p>
        Результат readable: <code>{JSON.stringify(after)}</code>
      </p>
      <p style={{ color: equal ? "#9ece6a" : "#ff5f57", fontWeight: 700 }}>
        {equal ? "✓ Результати однакові — різниця лише в читабельності" : "✗ Результати відрізняються"}
      </p>
    </div>
  );
}
