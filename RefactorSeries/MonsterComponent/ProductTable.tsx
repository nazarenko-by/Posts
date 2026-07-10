// demo/ProductTable.tsx — Рефакторинг живого коду #1
// Одна відповідальність: показати відфільтрований список і повідомити про клік.

import React from "react";
import { Product } from "./types";

export function ProductTable({
  products,
  filter,
  onSelect,
}: {
  products: Product[];
  filter: string;
  onSelect: (p: Product) => void;
}) {
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    return <p style={{ color: "#565f89" }}>Нічого не знайдено.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {filtered.map((p) => (
          <tr
            key={p.id}
            onClick={() => onSelect(p)}
            style={{ cursor: "pointer", borderBottom: "1px solid #2a2c4a" }}
          >
            <td style={{ padding: "8px 4px", color: "#c0caf5" }}>{p.name}</td>
            <td style={{ padding: "8px 4px", color: "#9ece6a", textAlign: "right" }}>
              {p.price} грн
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
