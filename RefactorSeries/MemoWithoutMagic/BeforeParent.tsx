// BeforeParent.tsx — Рефакторинг живого коду #5
// "До": onSelect — нова функція щоразу, memo на ExpensiveList не рятує.

import React, { useState } from "react";
import { ExpensiveList } from "./ExpensiveList";

const ITEMS = [
  { id: 1, name: "Товар А" },
  { id: 2, name: "Товар Б" },
  { id: 3, name: "Товар В" },
];

export function BeforeParent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>
        Клік (count: {count})
      </button>
      <div style={{ marginTop: 8 }}>
        <ExpensiveList
          items={ITEMS}
          onSelect={(id) => console.log("selected", id)}
        />
      </div>
    </div>
  );
}
