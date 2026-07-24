// readable.ts — Code review #1
// "Після": та сама логіка, назви відповідають "що це і що робить".

import { Order } from "./types";

export function calculateActiveOrderTotals(orders: Order[]): number[] {
  const activeOrders = orders.filter((order) => order.isActive);
  return activeOrders.map((order) => order.price * order.quantity);
}
