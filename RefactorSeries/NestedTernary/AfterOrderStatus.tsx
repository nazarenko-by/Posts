// AfterOrderStatus.tsx — Рефакторинг живого коду #4
// "Після": один lookup, нуль вкладеності.

import React from "react";
import { OrderStatus } from "./types";
import { STATUS_MAP, UNKNOWN_STATUS } from "./statusMap";

export function AfterOrderStatus({ status }: { status: OrderStatus }) {
  const { label, color } =
    status === "unknown" ? UNKNOWN_STATUS : STATUS_MAP[status] ?? UNKNOWN_STATUS;

  return <span style={{ color }}>{label}</span>;
}
