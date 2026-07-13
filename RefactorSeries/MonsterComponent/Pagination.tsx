// Pagination.tsx — Рефакторинг живого коду #1
// Одна відповідальність: показати сторінки. Навмисно "тупий" компонент — без стану.

import React from "react";

export function Pagination({
  page = 1,
  total = 1,
}: {
  page?: number;
  total?: number;
}) {
  return (
    <div style={{ marginTop: 12, color: "#565f89", fontSize: 13, textAlign: "center" }}>
      Сторінка {page} з {total}
    </div>
  );
}
