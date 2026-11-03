export type Status = "draft" | "paid" | "shipped" | "cancelled";
export const isDone = (s: Status) => s === "shipped";
