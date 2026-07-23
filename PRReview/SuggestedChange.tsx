// SuggestedChange.tsx — Пост 140: GitHub PR review
// Живий мокап ```suggestion``` блоку: клік по "Commit suggestion"
// одразу підміняє рядок, як і в реальному GitHub review.

import React, { useState } from "react";

const BEFORE = "return items.map(i => i.price).reduce((a, b) => a + b);";
const AFTER = "return items.reduce((sum, i) => sum + i.price, 0);";

export function SuggestedChange() {
  const [committed, setCommitted] = useState(false);

  return (
    <div>
      <div
        style={{
          padding: "6px 10px",
          fontFamily: "monospace",
          fontSize: 13,
          background: committed ? "#565f8922" : "#ff5f5722",
          borderLeft: `3px solid ${committed ? "#565f89" : "#ff5f57"}`,
          textDecoration: committed ? "line-through" : "none",
          opacity: committed ? 0.6 : 1,
        }}
      >
        - {BEFORE}
      </div>
      <div
        style={{
          padding: "6px 10px",
          fontFamily: "monospace",
          fontSize: 13,
          background: "#9ece6a22",
          borderLeft: "3px solid #9ece6a",
        }}
      >
        + {AFTER}
      </div>

      {!committed ? (
        <button style={{ marginTop: 10 }} onClick={() => setCommitted(true)}>
          Commit suggestion
        </button>
      ) : (
        <p style={{ marginTop: 10, color: "#9ece6a" }}>✓ committed</p>
      )}
    </div>
  );
}
