import { useState } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", teal: "#1abc9c",
  muted: "#565f89", text: "#c0caf5",
  red: "#ff5f57", danger: "#2d1f1f",
};

const Kw  = ({ c }) => <span style={{ color: C.purple }}>{c}</span>;
const Fn  = ({ c }) => <span style={{ color: C.accent }}>{c}</span>;
const Str = ({ c }) => <span style={{ color: C.green }}>{c}</span>;
const Cm  = ({ c }) => <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>;
const Tx  = ({ c }) => <span style={{ color: C.text }}>{c}</span>;
const Ty  = ({ c }) => <span style={{ color: C.yellow }}>{c}</span>;

function CodeLine({ ln, children, highlight, dim }) {
  return (
    <div style={{
      display: "flex", gap: 12, lineHeight: "1.85",
      opacity: dim ? 0.35 : 1,
      background: highlight ? C.teal + "12" : "transparent",
      borderLeft: `2px solid ${highlight ? C.teal : "transparent"}`,
      paddingLeft: 4, borderRadius: 2,
    }}>
      <span style={{ color: "#2a2c4a", minWidth: 20, textAlign: "right", fontSize: 10, userSelect: "none", flexShrink: 0 }}>{ln}</span>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono','Fira Code',monospace", whiteSpace: "pre" }}>{children}</span>
    </div>
  );
}

// ── Shadcn-style Button variants ──────────────────────────────────────────────
const btnBase = {
  borderRadius: 6, padding: "8px 18px", fontSize: 13,
  fontFamily: "'JetBrains Mono','Fira Code',monospace",
  fontWeight: 600, cursor: "pointer", border: "1px solid transparent",
  transition: "opacity 0.15s",
};

const variants = {
  default:     { background: C.accent,  color: C.bg,      borderColor: C.accent },
  outline:     { background: "transparent", color: C.accent, borderColor: C.accent },
  ghost:       { background: "transparent", color: C.text,   borderColor: "transparent" },
  destructive: { background: C.red,     color: "#fff",     borderColor: C.red },
  secondary:   { background: C.surface2, color: C.text,   borderColor: C.border },
};

function ShadcnButton({ variant = "default", children, active, onClick }) {
  const s = variants[variant] || variants.default;
  return (
    <button onClick={onClick} style={{
      ...btnBase, ...s,
      opacity: active ? 1 : 0.75,
      outline: active ? `2px solid ${C.teal}` : "none",
      outlineOffset: 2,
    }}>
      {children}
    </button>
  );
}

// ── File Tree ─────────────────────────────────────────────────────────────────
function FileTree() {
  const items = [
    { indent: 0, icon: "📁", name: "src/", color: C.yellow },
    { indent: 1, icon: "📁", name: "components/", color: C.yellow },
    { indent: 2, icon: "📁", name: "ui/", color: C.teal, highlight: true },
    { indent: 3, icon: "📄", name: "button.tsx", color: C.accent, highlight: true },
    { indent: 3, icon: "📄", name: "input.tsx", color: C.accent, highlight: true },
    { indent: 3, icon: "📄", name: "dialog.tsx", color: C.accent, highlight: true },
    { indent: 2, icon: "📄", name: "Header.tsx", color: C.text },
    { indent: 1, icon: "📁", name: "lib/", color: C.yellow },
    { indent: 2, icon: "📄", name: "utils.ts", color: C.text, highlight: true },
    { indent: 0, icon: "📄", name: "components.json", color: C.orange, highlight: true },
  ];

  return (
    <div style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 6,
          paddingLeft: item.indent * 18,
          padding: `3px 6px 3px ${item.indent * 18 + 6}px`,
          borderRadius: 4,
          background: item.highlight ? C.teal + "12" : "transparent",
          marginBottom: 1,
        }}>
          <span style={{ fontSize: 11 }}>{item.icon}</span>
          <span style={{ color: item.color, fontWeight: item.highlight ? 600 : 400 }}>
            {item.name}
          </span>
          {item.highlight && item.name === "button.tsx" && (
            <span style={{ marginLeft: "auto", fontSize: 9, color: C.teal, background: C.teal + "22", padding: "1px 6px", borderRadius: 99 }}>
              твій код
            </span>
          )}
          {item.highlight && item.name === "components.json" && (
            <span style={{ marginLeft: "auto", fontSize: 9, color: C.orange, background: C.orange + "22", padding: "1px 6px", borderRadius: 99 }}>
              конфіг
            </span>
          )}
        </div>
      ))}
      <div style={{ marginTop: 10, padding: "8px 10px", background: C.surface2, borderRadius: 6, fontSize: 11, color: C.muted, borderLeft: `2px solid ${C.teal}` }}>
        <span style={{ color: C.teal }}>ui/</span>
        {" — компоненти які ти скопіював. Вони твої."}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("preview");
  const [activeVariant, setActiveVariant] = useState("default");

  const tabs = [
    { id: "preview",   label: "Preview",    color: C.accent },
    { id: "code",      label: "button.tsx", color: C.purple },
    { id: "structure", label: "Структура",  color: C.teal },
  ];

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

        {/* titlebar */}
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
            <span style={{ color: C.muted, fontSize: 11 }}>button.tsx</span>
            <span style={{ background: C.accent + "22", color: C.accent, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              Modern UI #1
            </span>
          </div>
          <span style={{ color: C.muted, fontSize: 10 }}>@nby.frontend</span>
        </div>

        {/* tabs */}
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderTop: `1px solid ${C.border}`, borderBottom: "none", display: "flex",
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "9px 4px",
              background: tab === t.id ? C.surface : "transparent",
              border: "none",
              borderBottom: `2px solid ${tab === t.id ? t.color : "transparent"}`,
              color: tab === t.id ? t.color : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit",
            }}>{t.label}</button>
          ))}
        </div>

        {/* content */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderTop: "none", borderRadius: "0 0 14px 14px", padding: "20px 16px",
          minHeight: 280,
        }}>

          {/* ── Preview ── */}
          {tab === "preview" && (
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
                {"// variant="}<span style={{ color: C.green }}>{`"${activeVariant}"`}</span>
              </div>

              {/* big button display */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, padding: "24px 0", background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <ShadcnButton variant={activeVariant} active>
                  {activeVariant === "destructive" ? "Delete account" : "Click me"}
                </ShadcnButton>
              </div>

              {/* variant picker */}
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>{"// обери варіант:"}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.keys(variants).map(v => (
                  <button key={v} onClick={() => setActiveVariant(v)} style={{
                    ...btnBase, ...variants[v], fontSize: 11, padding: "5px 12px",
                    outline: activeVariant === v ? `2px solid ${C.teal}` : "none",
                    outlineOffset: 2, opacity: 1,
                  }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Code ── */}
          {tab === "code" && (
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
                {"// src/components/ui/button.tsx — повністю твій файл"}
              </div>
              <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 8px" }}>
                <CodeLine ln="1"><Kw c="import" /><Tx c=" * " /><Kw c="as" /><Tx c=" React " /><Kw c="from" /><Str c=" 'react'" /></CodeLine>
                <CodeLine ln="2"><Kw c="import" /><Tx c=" " /><Ty c="{ cva }" /><Tx c=" " /><Kw c="from" /><Str c=" 'class-variance-authority'" /></CodeLine>
                <CodeLine ln="3"><Tx c="" /></CodeLine>
                <CodeLine ln="4" highlight><Kw c="const" /><Tx c=" buttonVariants = " /><Fn c="cva" /><Tx c="(" /></CodeLine>
                <CodeLine ln="5" highlight><Str c="  'rounded-md font-medium transition-colors'" /></CodeLine>
                <CodeLine ln="6"><Tx c="  {" /></CodeLine>
                <CodeLine ln="7"><Tx c="    variants: {" /></CodeLine>
                <CodeLine ln="8"><Tx c="      variant: {" /></CodeLine>
                <CodeLine ln="9"><Tx c="        default: " /><Str c="'bg-primary text-white'" /></CodeLine>
                <CodeLine ln="10"><Tx c="        outline: " /><Str c="'border border-primary'" /></CodeLine>
                <CodeLine ln="11"><Tx c="        ghost:   " /><Str c="'hover:bg-accent'" /></CodeLine>
                <CodeLine ln="12"><Tx c="      }" /></CodeLine>
                <CodeLine ln="13"><Tx c="    }" /></CodeLine>
                <CodeLine ln="14"><Tx c="  }" /></CodeLine>
                <CodeLine ln="15"><Tx c=")" /></CodeLine>
                <CodeLine ln="16"><Tx c="" /></CodeLine>
                <CodeLine ln="17" highlight><Cm c="// редагуй прямо тут — це твій код" /></CodeLine>
              </div>
            </div>
          )}

          {/* ── Structure ── */}
          {tab === "structure" && (
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
                {"// після: npx shadcn@latest add button"}
              </div>
              <FileTree />
            </div>
          )}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          {"💡 shadcn — не пакет. Код живе у тебе в проєкті."}
        </div>

      </div>
    </div>
  );
}
