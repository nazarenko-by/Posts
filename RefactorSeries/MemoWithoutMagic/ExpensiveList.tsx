// ExpensiveList.tsx — Рефакторинг живого коду #5
// Обгорнутий у React.memo, з видимим лічильником власних рендерів
// (useRef, щоб сам лічильник не викликав додаткового рендеру).

import React, { useRef } from "react";

interface Item {
  id: number;
  name: string;
}

interface Props {
  items: Item[];
  onSelect: (id: number) => void;
}

export const ExpensiveList = React.memo(function ExpensiveList({ items, onSelect }: Props) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div style={{ border: "1px solid #2a2c4a", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 13, color: "#565f89", marginBottom: 6 }}>
        ExpensiveList render #{renderCount.current}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          style={{ cursor: "pointer", padding: "4px 0" }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
});
