// index.tsx — Code review #2
// OverengineeredButton і SimpleButton поруч — однаковий рендер,
// різниця лише в кількості коду, який довелось написати й підтримувати.

import React from "react";
import { OverengineeredButton } from "./OverengineeredButton";
import { SimpleButton } from "./SimpleButton";

export default function Demo() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 460 }}>
      <h2>Overengineering vs YAGNI</h2>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <b>ButtonFactory (~25 рядків)</b>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <OverengineeredButton type="primary">Primary</OverengineeredButton>
            <OverengineeredButton type="secondary">Secondary</OverengineeredButton>
          </div>
        </div>
        <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: 12 }}>
          <b>SimpleButton (5 рядків)</b>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <SimpleButton variant="primary">Primary</SimpleButton>
            <SimpleButton variant="secondary">Secondary</SimpleButton>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        Обидва варіанти дають однаковий className і однаковий рендер.
        Різниця - у тому, скільки коду треба прочитати й підтримувати заради двох варіантів.
      </p>
    </div>
  );
}
