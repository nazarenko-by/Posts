// cryptic.ts — Code review #1
// "До": та сама логіка, криптичні назви — саме такий коментар
// найчастіше лишають в code review.

import { Order } from "./types";

export function process(d: Order[]): number[] {
  const r = d.filter((x) => x.isActive);
  return r.map((x) => x.price * x.quantity);
}
