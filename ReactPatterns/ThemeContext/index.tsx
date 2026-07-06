import { useState } from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";

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

// The component that actually needs the theme — nested three levels deep.
function DeepButton() {
  const theme = useTheme();
  return (
    <div style={{
      background: theme === "dark" ? C.surface2 : "#e8e8f0",
      color: theme === "dark" ? C.teal : "#1a1b2e",
      borderRadius: 8, padding: "10px 16px", fontSize: 13, textAlign: "center",
    }}>
      theme (via useContext): <b>{theme}</b>
    </div>
  );
}
function Toolbar() { return <DeepButton />; }
function Header() { return <Toolbar />; }

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
            <span style={{ color: C.muted, fontSize: 11 }}>ThemeContext.tsx</span>
            <span style={{ background: C.teal + "22", color: C.teal, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              React Patterns #4
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: C.text, lineHeight: 1.7 }}>
              <div style={{ color: C.muted }}>{"// theme передається пропсом крізь усі рівні"}</div>
              <div>{"<App theme>"}</div>
              <div style={{ paddingLeft: 14, color: C.red }}>{"<Header theme> // транзит"}</div>
              <div style={{ paddingLeft: 28, color: C.red }}>{"<Toolbar theme> // транзит"}</div>
              <div style={{ paddingLeft: 42, color: C.green }}>{"<Button theme> // використовує"}</div>
            </div>
          )}

          {active === "solution" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: C.text, lineHeight: 1.7 }}>
              <div style={{ color: C.muted }}>{"// Provider зверху, useContext — де реально треба"}</div>
              <div style={{ color: C.teal }}>{"<ThemeContext.Provider value={theme}>"}</div>
              <div style={{ paddingLeft: 14 }}>{"<Header>  // без theme"}</div>
              <div style={{ paddingLeft: 28 }}>{"<Toolbar>  // без theme"}</div>
              <div style={{ paddingLeft: 42, color: C.green }}>{"<Button>  // useContext(ThemeContext)"}</div>
            </div>
          )}

          {active === "live" && (
            <ThemeProvider>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ color: C.muted, fontSize: 11 }}>
                  {"// App → Header → Toolbar → Button, жоден проміжний рівень не знає про theme"}
                </div>
                <Header />
              </div>
            </ThemeProvider>
          )}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          💡 Provider вгорі дерева, useContext — рівно там де треба
        </div>

      </div>
    </div>
  );
}
