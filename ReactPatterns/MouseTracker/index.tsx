import { useState } from "react";
import { MouseTracker } from "./MouseTracker";

// Tokyo Night palette — see POST_GUIDE.md
const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57", teal: "#1abc9c",
};

const TABS = [
  { id: "problem", label: "Проблема", color: C.red },
  { id: "solution", label: "Рішення", color: C.green },
  { id: "live", label: "Жива демонстрація", color: C.teal },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Demo() {
  const [active, setActive] = useState<TabId>("problem");

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 640 }}>

        {/* VS Code titlebar */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderBottom: "none", borderRadius: "14px 14px 0 0",
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[C.red, "#ffbd2e", "#28c840"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 11 }}>MouseTracker.tsx</span>
            <span style={{ background: C.teal + "22", color: C.teal, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              React Patterns #2
            </span>
          </div>
          <span style={{ color: C.muted, fontSize: 10 }}>@nby.frontend</span>
        </div>

        {/* tab bar */}
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderTop: `1px solid ${C.border}`, borderBottom: "none", display: "flex",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              flex: 1, padding: "9px 4px",
              background: active === t.id ? C.surface : "transparent",
              border: "none",
              borderBottom: `2px solid ${active === t.id ? t.color : "transparent"}`,
              color: active === t.id ? t.color : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit",
            }}>{t.label}</button>
          ))}
        </div>

        {/* content */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderTop: "none", borderRadius: "0 0 14px 14px", padding: "16px",
          minHeight: 220,
        }}>
          {active === "problem" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: C.text, lineHeight: 1.7 }}>
              <div style={{ color: C.muted }}>{"// два компоненти, однакова логіка"}</div>
              <div>ComponentA: <span style={{ color: C.red }}>useState + useEffect</span></div>
              <div>ComponentB: <span style={{ color: C.red }}>useState + useEffect (копія)</span></div>
            </div>
          )}

          {active === "solution" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: C.text, lineHeight: 1.7 }}>
              <div style={{ color: C.muted }}>{"// одна MouseTracker, дві consumer-функції"}</div>
              <div><span style={{ color: C.green }}>{"<MouseTracker>"}</span></div>
              <div style={{ paddingLeft: 12 }}>{"{pos => <div>A: {pos.x}, {pos.y}</div>}"}</div>
              <div><span style={{ color: C.green }}>{"</MouseTracker>"}</span></div>
            </div>
          )}

          {active === "live" && (
            <MouseTracker>
              {pos => (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.text }}>
                  <div style={{ color: C.muted, fontSize: 11 }}>{"// рухай мишею над сторінкою"}</div>
                  <div style={{ background: C.surface2, borderRadius: 8, padding: "10px 14px" }}>
                    x: <span style={{ color: C.teal, fontWeight: 700 }}>{pos.x}</span>{"  "}
                    y: <span style={{ color: C.teal, fontWeight: 700 }}>{pos.y}</span>
                  </div>
                </div>
              )}
            </MouseTracker>
          )}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          💡 та ж MouseTracker, дві різні відображення через children-функцію
        </div>

      </div>
    </div>
  );
}
