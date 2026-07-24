// equivalence.test.ts — Code review #1
// Доводить, що cryptic.ts і readable.ts поводяться однаково —
// різниця лише в читабельності, не в поведінці.

import { process } from "./cryptic";
import { calculateActiveOrderTotals } from "./readable";
import { Order } from "./types";

const SAMPLE_ORDERS: Order[] = [
  { isActive: true, price: 100, quantity: 2 },
  { isActive: false, price: 50, quantity: 3 },
  { isActive: true, price: 20, quantity: 5 },
];

function assertSameResult() {
  const before = process(SAMPLE_ORDERS);
  const after = calculateActiveOrderTotals(SAMPLE_ORDERS);
  const equal = JSON.stringify(before) === JSON.stringify(after);
  if (!equal) {
    throw new Error(`Results differ: ${JSON.stringify(before)} vs ${JSON.stringify(after)}`);
  }
  return { before, after, equal };
}

export { assertSameResult };
