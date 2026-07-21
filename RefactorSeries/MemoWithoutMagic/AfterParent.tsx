// AfterParent.tsx — Рефакторинг живого коду #5
// "Після": onSelect стабілізований через useCallback — memo нарешті працює.

import React, { useCallback, useState } from "react";
import { ExpensiveList } from "./ExpensiveList";

const ITEMS = [
  { id: 1, name: "Товар А" },
  { id: 2, name: "Товар Б" },
  { id: 3, name: "Товар В" },
];

export function AfterParent() {
  const [count, setCount] = useState(0);

  const handleSelect = useCallback((id: number) => {
    console.log("selected", id);
  }, []);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>
        Клік (count: {count})
      </button>
      <div style={{ marginTop: 8 }}>
        <ExpensiveList items={ITEMS} onSelect={handleSelect} />
      </div>
    </div>
  );
}
