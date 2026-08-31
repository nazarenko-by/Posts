// index.tsx — пост 175, entry point демо.
// Тільки імпортує і рендерить компонент - логіка живе в useWindowWidth.ts
// і WidthReadout.tsx (окремі файли, див. POST_GUIDE.md "Оновлено 28.08.2026").

import React from "react";
import WidthReadout from "./WidthReadout";

export default function WindowWidthDemo() {
  return <WidthReadout />;
}
