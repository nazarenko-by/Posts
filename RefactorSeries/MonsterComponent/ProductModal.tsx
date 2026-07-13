// ProductModal.tsx — Рефакторинг живого коду #1
// Одна відповідальність: показати деталі обраного товару.

import React from "react";
import { Product } from "./types";

export function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,13,20,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1b2e",
          border: "1px solid #2a2c4a",
          borderRadius: 10,
          padding: 20,
          minWidth: 260,
        }}
      >
        <h3 style={{ margin: 0, color: "#c0caf5" }}>{product.name}</h3>
        <p style={{ color: "#565f89", fontSize: 13 }}>{product.category}</p>
        <p style={{ color: "#9ece6a", fontWeight: 700 }}>{product.price} грн</p>
        <button onClick={onClose}>Закрити</button>
      </div>
    </div>
  );
}
