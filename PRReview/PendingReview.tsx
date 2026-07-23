// PendingReview.tsx — Пост 140: GitHub PR review
// Живий мокап "Start a review": коментарі накопичуються локально
// і "публікуються" одним кліком замість окремих нотифікацій.

import React, { useState } from "react";

const DRAFT_COMMENTS = [
  "line 12: зайвий console.log",
  "line 28: винести в окрему функцію",
  "line 41: тут може бути null",
];

export function PendingReview() {
  const [added, setAdded] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const remaining = DRAFT_COMMENTS.filter((c) => !added.includes(c));

  return (
    <div>
      {!submitted && remaining.length > 0 && (
        <button onClick={() => setAdded((a) => [...a, remaining[0]])}>
          + Додати коментар до рядка
        </button>
      )}

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        {added.map((c) => (
          <div
            key={c}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              background: submitted ? "#9ece6a22" : "#e0af6822",
              border: `1px solid ${submitted ? "#9ece6a" : "#e0af68"}`,
              fontSize: 13,
            }}
          >
            {c}
          </div>
        ))}
      </div>

      {added.length > 0 && !submitted && (
        <button style={{ marginTop: 10 }} onClick={() => setSubmitted(true)}>
          Submit review ({added.length})
        </button>
      )}
      {submitted && (
        <p style={{ marginTop: 10, color: "#9ece6a" }}>
          ✓ 1 сповіщення надіслано автору (замість {added.length})
        </p>
      )}
    </div>
  );
}
