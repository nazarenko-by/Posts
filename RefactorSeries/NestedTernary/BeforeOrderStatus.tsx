// BeforeOrderStatus.tsx — Рефакторинг живого коду #4
// "До": чотирирівневий вкладений тернарник і для тексту, і для кольору.

import React from "react";
import { OrderStatus } from "./types";

export function BeforeOrderStatus({ status }: { status: OrderStatus }) {
  return (
    <span
      style={{
        color:
          status === "cancelled"
            ? "#ff5f57"
            : status === "shipped"
            ? "#9ece6a"
            : status === "paid"
            ? "#7dcfff"
            : status === "pending"
            ? "#e0af68"
            : "#565f89",
      }}
    >
      {status === "cancelled"
        ? "Скасовано"
        : status === "shipped"
        ? "Відправлено"
        : status === "paid"
        ? "Оплачено"
        : status === "pending"
        ? "Очікує"
        : "Невідомо"}
    </span>
  );
}
