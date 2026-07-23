// index.tsx — Пост 140: GitHub PR review — вбудовані фічі
// Три вкладки з живими мокапами: Pending review / Suggested change / Viewed.

import React, { useState } from "react";
import { PendingReview } from "./PendingReview";
import { SuggestedChange } from "./SuggestedChange";
import { ViewedFiles } from "./ViewedFiles";

const TABS = [
  { id: "pending", label: "Pending review", render: () => <PendingReview /> },
  { id: "suggestion", label: "Suggested change", render: () => <SuggestedChange /> },
  { id: "viewed", label: "Viewed", render: () => <ViewedFiles /> },
] as const;

export default function Demo() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("pending");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 440 }}>
      <h2>GitHub PR review — вбудовані фічі</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{ fontWeight: active === t.id ? 700 : 400 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
        {tab.render()}
      </div>

      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        Усі три - реальні кнопки GitHub review UI, не вигадка. Спробуй в наступному PR.
      </p>
    </div>
  );
}
