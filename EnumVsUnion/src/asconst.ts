export const Status = {
  Draft: "draft",
  Paid: "paid",
  Shipped: "shipped",
  Cancelled: "cancelled",
} as const;
export type Status = (typeof Status)[keyof typeof Status];
export const isDone = (s: Status) => s === Status.Shipped;
