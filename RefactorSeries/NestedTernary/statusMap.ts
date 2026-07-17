// statusMap.ts — Рефакторинг живого коду #4
// "Після": плаский lookup-об'єкт — один рядок на статус, нуль вкладеності.

import { OrderStatus } from "./types";

export const STATUS_MAP: Record<Exclude<OrderStatus, "unknown">, { label: string; color: string }> = {
  pending: { label: "Очікує", color: "#e0af68" },
  paid: { label: "Оплачено", color: "#7dcfff" },
  shipped: { label: "Відправлено", color: "#9ece6a" },
  cancelled: { label: "Скасовано", color: "#ff5f57" },
};

export const UNKNOWN_STATUS = { label: "Невідомо", color: "#565f89" };
