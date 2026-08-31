// index.tsx — пост 172, клікабельне демо
// Справжній useMediaQuery hook (та сама реалізація що на слайді 2), підписаний
// на реальний window.matchMedia. Зміни розмір вікна браузера - лейаут нижче
// перемикається наживо, без жодного resize-listener'а вручну.

import React, { useState, useEffect } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89", orange: "#ff9e64", accent: "#7dcfff",
};
const MONO = "'JetBrains Mono','Fira Code',monospace";

// Справжній useMediaQuery - той самий код, що на слайді 2.
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

const NAV_ITEMS = ["Головна", "Каталог", "Про нас", "Контакти"];

export default function MediaQueryDemo() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const color = isMobile ? C.orange : C.accent;

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: MONO,
        padding: 24,
        borderRadius: 12,
        maxWidth: 420,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>useMediaQuery</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px" }}>
        Зміни розмір вікна браузера (менше/більше за 640px) - нав нижче
        перемикається сам.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: `${color}20`,
          border: `1px solid ${color}66`,
          borderRadius: 8,
          padding: "8px 14px",
          marginBottom: 16,
        }}
      >
        <span style={{ color: C.muted, fontSize: 13 }}>{"isMobile:"}</span>
        <span style={{ color, fontSize: 15, fontWeight: 700 }}>
          {isMobile ? "true" : "false"}
        </span>
      </div>

      <div
        style={{
          background: C.surface,
          border: `1.5px solid ${color}`,
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        {isMobile ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700 }}>{"logo"}</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "6px 8px",
                border: `1.5px solid ${color}`,
                borderRadius: 6,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 16, height: 2, background: color, borderRadius: 1 }} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700 }}>{"logo"}</div>
            <div style={{ display: "flex", gap: 14 }}>
              {NAV_ITEMS.map((it) => (
                <span key={it} style={{ color: C.muted, fontSize: 13 }}>
                  {it}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
