export enum Status {
  Draft = "draft",
  Paid = "paid",
  Shipped = "shipped",
  Cancelled = "cancelled",
}
export const isDone = (s: Status) => s === Status.Shipped;
