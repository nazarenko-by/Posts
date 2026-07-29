// fixedAverage.ts — Code review #3
// "Після": одна перевірка на порожній масив -> null замість NaN.

import { Order } from "./types";

export function getAverageOrderFixed(orders: Order[]): number | null {
  if (!orders.length) return null;

  const total = orders.reduce((sum, o) => sum + o.amount, 0);
  return total / orders.length;
}
