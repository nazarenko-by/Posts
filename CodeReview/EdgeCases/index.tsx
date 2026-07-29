// index.tsx — Code review #3
// Дві версії getAverageOrder поруч + перемикач сценаріїв.
// "Помилка мережі" з buggy-версією реально створює unhandled promise rejection
// у браузері - ловимо її через window listener і показуємо в логу.

import React, { useEffect, useState } from "react";
import { Order } from "./types";
import { getAverageOrderBuggy } from "./buggyAverage";
import { getAverageOrderFixed } from "./fixedAverage";
import { fetchOrdersRaw } from "./fetchOrders";

type Scenario = "happy" | "empty" | "network";

const SAMPLE_ORDERS: Order[] = [
  { id: "1", amount: 800 },
  { id: "2", amount: 1200 },
  { id: "3", amount: 1750 },
];

export default function Demo() {
  const [scenario, setScenario] = useState<Scenario>("happy");
  const [buggyResult, setBuggyResult] = useState<string>("");
  const [fixedResult, setFixedResult] = useState<string>("");
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const onUnhandled = (e: PromiseRejectionEvent) => {
      setLog((prev) => [...prev, `🔴 Unhandled Promise Rejection: ${e.reason?.message ?? e.reason}`]);
    };
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => window.removeEventListener("unhandledrejection", onUnhandled);
  }, []);

  useEffect(() => {
    setLog([]);

    if (scenario === "happy") {
      setBuggyResult(`${getAverageOrderBuggy(SAMPLE_ORDERS)} грн`);
      const fixed = getAverageOrderFixed(SAMPLE_ORDERS);
      setFixedResult(fixed === null ? "Ще нема замовлень" : `${fixed} грн`);
      return;
    }

    if (scenario === "empty") {
      setBuggyResult(`${getAverageOrderBuggy([])} грн`); // NaN грн
      const fixed = getAverageOrderFixed([]);
      setFixedResult(fixed === null ? "Ще нема замовлень" : `${fixed} грн`);
      return;
    }

    // scenario === "network"
    setBuggyResult("...завантаження");
    setFixedResult("...завантаження");

    // Buggy: викликає й забуває - без .catch() рейджект стає unhandled
    fetchOrdersRaw(true).then((orders) => {
      setBuggyResult(`${getAverageOrderBuggy(orders)} грн`);
    });

    // Fixed: той самий запит, обгорнутий у try/catch
    (async () => {
      try {
        const orders = await fetchOrdersRaw(true);
        const avg = getAverageOrderFixed(orders);
        setFixedResult(avg === null ? "Ще нема замовлень" : `${avg} грн`);
      } catch {
        setFixedResult("⚠ Не вдалося завантажити. Спробуй ще раз.");
      }
    })();
  }, [scenario]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 520 }}>
      <h2>Edge cases і error handling</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setScenario("happy")}>3 замовлення</button>
        <button onClick={() => setScenario("empty")}>0 замовлень</button>
        <button onClick={() => setScenario("network")}>Помилка мережі</button>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <b>getAverageOrder (до)</b>
          <div style={{ marginTop: 8, color: buggyResult.startsWith("NaN") ? "crimson" : undefined }}>
            {buggyResult}
          </div>
        </div>
        <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <b>getAverageOrder (після)</b>
          <div style={{ marginTop: 8 }}>{fixedResult}</div>
        </div>
      </div>

      {log.length > 0 && (
        <div style={{
          marginTop: 16, background: "#1a1b2e", color: "#ff5f57",
          padding: 10, borderRadius: 8, fontSize: 12, fontFamily: "monospace",
        }}>
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        Той самий тестовий сценарій (3 замовлення) працює в обох версіях однаково.
        Різниця видно лише на порожньому кошику й обірваному запиті - саме там, куди review зазвичай не дивиться.
      </p>
    </div>
  );
}
