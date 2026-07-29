// buggyAverage.ts — Code review #3
// "До": рахує total / orders.length без жодної перевірки.
// Працює на тестових даних, ламається на порожньому кошику.

import { Order } from "./types";

export function getAverageOrderBuggy(orders: Order[]): number {
  const total = orders.reduce((sum, o) => sum + o.amount, 0);
  return total / orders.length;
}
