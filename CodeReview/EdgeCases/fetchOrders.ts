// fetchOrders.ts — Code review #3
// Симулює мережевий запит, який іноді падає.
// Сам по собі нейтральний — небезпечно те, як його викликають (дивись index.tsx).

import { Order } from "./types";

const SAMPLE_ORDERS: Order[] = [
  { id: "1", amount: 800 },
  { id: "2", amount: 1200 },
  { id: "3", amount: 1750 },
];

export function fetchOrdersRaw(shouldFail: boolean): Promise<Order[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Network request failed"));
        return;
      }
      resolve(SAMPLE_ORDERS);
    }, 400);
  });
}
