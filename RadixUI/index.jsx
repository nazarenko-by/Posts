import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", teal: "#1abc9c",
  muted: "#565f89", text: "#c0caf5",
  red: "#ff5f57",
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

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 9, padding: "2px 7px", borderRadius: 99,
      background: color + "22", color, border: `1px solid ${color}44`,
      fontWeight: 600,
    }}>{label}</span>
  );
}

// ── Dialog primitive (headless behaviour: Escape, focus trap, overlay click) ──
function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState([]);
  const closeRef = useRef(null);

  const addLog = (msg) => setLog(p => [`→ ${msg}`, ...p].slice(0, 4));

  useEffect(() => {
    if (!open) return;
    // focus trap: focus close button on open
    setTimeout(() => closeRef.current?.focus(), 50);
    addLog("focus trap активовано");

    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); addLog("Escape — dialog закрито"); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>Dialog.Root</span>
        <Badge label="focus trap" color={C.teal} />
        <Badge label="Escape" color={C.purple} />
        <Badge label="aria" color={C.orange} />
      </div>

      <button
        onClick={() => { setOpen(true); addLog("Dialog.Trigger — відкрито"); }}
        style={{
          background: C.accent + "22", border: `1px solid ${C.accent}55`,
          borderRadius: 8, padding: "9px 20px", color: C.accent,
          fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          alignSelf: "flex-start",
        }}
      >
        {"<Dialog.Trigger>"}
      </button>

      {/* log */}
      <div style={{ background: C.surface2, borderRadius: 8, padding: "8px 12px", minHeight: 60 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{"// radix events:"}</div>
        {log.length === 0
          ? <div style={{ fontSize: 11, color: C.muted }}>натисни кнопку...</div>
          : log.map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: i === 0 ? C.teal : C.muted, lineHeight: 1.7 }}>{l}</div>
          ))
        }
      </div>

      {/* Dialog overlay + content */}
      {open && (
        <div
          onClick={() => { setOpen(false); addLog("Overlay click — dialog закрито"); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "24px", width: 300, maxWidth: "90vw",
              position: "relative",
            }}
          >
            {/* aria label shown */}
            <div style={{ fontSize: 9, color: C.teal, marginBottom: 8, fontFamily: "inherit" }}>
              {"role=\"dialog\" aria-modal=\"true\" ← Radix додає автоматично"}
            </div>
            <div id="dialog-title" style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              {"<Dialog.Title>"}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
              Натисни Escape або клікни поза діалогом — Radix закриє його автоматично.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                ref={closeRef}
                onClick={() => { setOpen(false); addLog("Dialog.Close — закрито"); }}
                style={{
                  background: C.red + "22", border: `1px solid ${C.red}55`,
                  borderRadius: 8, padding: "7px 16px", color: C.red,
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {"<Dialog.Close>"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dropdown primitive ────────────────────────────────────────────────────────
function DropdownDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [focused, setFocused] = useState(0);
  const [log, setLog] = useState([]);
  const addLog = (msg) => setLog(p => [`→ ${msg}`, ...p].slice(0, 4));

  const items = ["Профіль", "Налаштування", "Документація", "Вийти"];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); addLog("Escape — закрито"); }
      if (e.key === "ArrowDown") { setFocused(p => Math.min(p + 1, items.length - 1)); addLog("ArrowDown"); e.preventDefault(); }
      if (e.key === "ArrowUp") { setFocused(p => Math.max(p - 1, 0)); addLog("ArrowUp"); e.preventDefault(); }
      if (e.key === "Enter") { setSelected(items[focused]); setOpen(false); addLog(`Enter — обрано "${items[focused]}"`); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, focused]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 12, color: C.purple, fontWeight: 600 }}>DropdownMenu.Root</span>
        <Badge label="keyboard nav" color={C.teal} />
        <Badge label="Escape" color={C.purple} />
      </div>

      <div style={{ position: "relative", alignSelf: "flex-start" }}>
        <button
          onClick={() => { setOpen(p => !p); setFocused(0); addLog(open ? "закрито" : "відкрито"); }}
          style={{
            background: C.purple + "22", border: `1px solid ${C.purple}55`,
            borderRadius: 8, padding: "9px 20px", color: C.purple,
            fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          }}
        >
          {"<DropdownMenu.Trigger>"} {open ? "▲" : "▼"}
        </button>

        {open && (
          <div
            role="menu"
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0,
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, overflow: "hidden", minWidth: 180,
              zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {items.map((item, i) => (
              <div
                key={item}
                role="menuitem"
                onClick={() => { setSelected(item); setOpen(false); addLog(`обрано "${item}"`); }}
                onMouseEnter={() => setFocused(i)}
                style={{
                  padding: "9px 16px", fontSize: 12, cursor: "pointer",
                  background: focused === i ? C.purple + "22" : "transparent",
                  color: focused === i ? C.purple : C.text,
                  borderLeft: `2px solid ${focused === i ? C.purple : "transparent"}`,
                  transition: "all 0.1s",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ fontSize: 11, color: C.green }}>{"✓ обрано: " + selected}</div>
      )}

      <div style={{ background: C.surface2, borderRadius: 8, padding: "8px 12px", minHeight: 60 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{"// radix events:"}</div>
        {log.length === 0
          ? <div style={{ fontSize: 11, color: C.muted }}>натисни тригер або використай ↑↓ Enter...</div>
          : log.map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: i === 0 ? C.purple : C.muted, lineHeight: 1.7 }}>{l}</div>
          ))
        }
      </div>
    </div>
  );
}

// ── Code tab ──────────────────────────────────────────────────────────────────
function CodeTab() {
  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 8px" }}>
      <CodeLine ln="1"><Cm c="// headless — логіка без стилів" /></CodeLine>
      <CodeLine ln="2"><Kw c="import" /><Tx c=" * " /><Kw c="as" /><Tx c=" " /><Ty c="Dialog" /><Tx c=" " /><Kw c="from" /><Str c=" '@radix-ui/react-dialog'" /></CodeLine>
      <CodeLine ln="3"><Tx c="" /></CodeLine>
      <CodeLine ln="4" highlight><Cm c="// Radix додає: focus trap, Escape, aria-*" /></CodeLine>
      <CodeLine ln="5"><Ty c="Dialog" /><Tx c="." /><Fn c="Root" /><Tx c=" " /><Cm c="// стан відкритий/закритий" /></CodeLine>
      <CodeLine ln="6"><Ty c="Dialog" /><Tx c="." /><Fn c="Trigger" /><Tx c=" " /><Cm c="// кнопка відкриття" /></CodeLine>
      <CodeLine ln="7"><Ty c="Dialog" /><Tx c="." /><Fn c="Portal" /><Tx c=" " /><Cm c="// рендер поза деревом" /></CodeLine>
      <CodeLine ln="8"><Ty c="Dialog" /><Tx c="." /><Fn c="Overlay" /><Tx c=" " /><Cm c="// backdrop" /></CodeLine>
      <CodeLine ln="9" highlight><Ty c="Dialog" /><Tx c="." /><Fn c="Content" /><Tx c=" " /><Cm c="// сам діалог" /></CodeLine>
      <CodeLine ln="10"><Ty c="Dialog" /><Tx c="." /><Fn c="Close" /><Tx c=" " /><Cm c="// кнопка закриття" /></CodeLine>
      <CodeLine ln="11"><Tx c="" /></CodeLine>
      <CodeLine ln="12"><Cm c="// стилі — повністю твої:" /></CodeLine>
      <CodeLine ln="13"><Tx c="  " /><Str c={"className='fixed top-1/2 bg-white rounded-lg'"} /></CodeLine>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dialog");

  const tabs = [
    { id: "dialog",   label: "Dialog",   color: C.accent },
    { id: "dropdown", label: "Dropdown", color: C.purple },
    { id: "code",     label: "Код",      color: C.teal },
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
      <div style={{ width: "100%", maxWidth: 620 }}>

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
            <span style={{ color: C.muted, fontSize: 11 }}>radix-primitives.tsx</span>
            <span style={{ background: C.accent + "22", color: C.accent, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              Modern UI #2
            </span>
          </div>
          <span style={{ color: C.muted, fontSize: 10 }}>@nby.frontend</span>
        </div>

        {/* tabs */}
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderBottom: "none", display: "flex",
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
          borderTop: "none", borderRadius: "0 0 14px 14px",
          padding: "20px 16px", minHeight: 300,
        }}>
          {tab === "dialog"   && <DialogDemo />}
          {tab === "dropdown" && <DropdownDemo />}
          {tab === "code"     && <CodeTab />}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          {"💡 headless = поведінка вже є, стилі — твої"}
        </div>

      </div>
    </div>
  );
}
