// index.tsx — пост 176, entry point демо.
// Тільки імпортує і рендерить компонент - логіка живе в useDeviceType.ts
// і DeviceCard.tsx (окремі файли, див. POST_GUIDE.md "Оновлено 28.08.2026").

import React from "react";
import DeviceCard from "./DeviceCard";

export default function DeviceTypeDemo() {
  return <DeviceCard />;
}
