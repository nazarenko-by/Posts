import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";

// ── Tokyo Night palette ───────────────────────────────────────────────────────
const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5",
  red: "#ff5f57",
};

// ── shared styles ─────────────────────────────────────────────────────────────
const s = {
  panel: {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 10, overflow: "hidden",
  },
  panelHeader: {
    padding: "10px 14px", background: C.surface2,
    borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 11, color: C.muted,
  },
  card: {
    background: C.surface2, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "14px 18px",
    fontSize: 13, textAlign: "center",
    position: "absolute", width: "calc(100% - 28px)",
  },
  btn: (color = C.purple) => ({
    background: "transparent", border: `1px solid ${color}55`,
    borderRadius: 7, padding: "8px 16px",
    color: color, fontSize: 12, cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
  }),
  label: { fontSize: 11, color: C.muted, marginBottom: 6 },
};

const Dots = () => (
  <div style={{ display: "flex", gap: 5 }}>
    {[C.red, C.yellow, C.green].map((c, i) => (
      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
    ))}
  </div>
);

// ── TAB 1: Basic ──────────────────────────────────────────────────────────────
function BasicTab() {
  const [visible, setVisible] = useState(true);
  const [dur, setDur] = useState(0.3);
  const [logs, setLogs] = useState([{ msg: "component mounted (initial render)", type: "info" }]);
  const logRef = useRef(null);

  const addLog = (msg, type) => {
    setLogs(p => [...p.slice(-20), { msg, type, id: Date.now() + Math.random() }]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const toggle = () => {
    if (visible) {
      addLog("exit triggered on both components", "exit");
      addLog("without AnimatePresence: removed instantly (no exit animation)", "exit");
    } else {
      addLog("mount triggered on both components", "enter");
      addLog("without AnimatePresence: appeared instantly", "enter");
    }
    setVisible(v => !v);
  };

  const logColor = { enter: C.green, exit: C.orange, info: C.accent };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <button style={s.btn(C.green)} onClick={toggle}>toggle component</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.muted }}>duration:</span>
          <input type="range" min={100} max={800} step={50} value={dur * 1000}
            onChange={e => setDur(e.target.value / 1000)}
            style={{ width: 80 }} />
          <span style={{ fontSize: 11, color: C.yellow, minWidth: 38 }}>{Math.round(dur * 1000)}ms</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: visible ? C.green : C.orange }}>
          ● {visible ? "mounted" : "unmounted"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Without AnimatePresence */}
        <div>
          <div style={s.label}>// without AnimatePresence</div>
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <Dots />
              <span style={{ marginLeft: 4 }}>no wrapper</span>
            </div>
            <div style={{ padding: 14, minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {visible && (
                <div style={s.card}>
                  <div style={{ color: C.accent, marginBottom: 4 }}>component</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>exit never fires</div>
                  <div style={{ display: "inline-block", background: `${C.red}22`, border: `1px solid ${C.red}55`, borderRadius: 4, padding: "2px 7px", fontSize: 10, color: C.red, marginTop: 6 }}>✗ no exit</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* With AnimatePresence */}
        <div>
          <div style={s.label}>// with AnimatePresence</div>
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <Dots />
              <span style={{ marginLeft: 4 }}>AnimatePresence</span>
            </div>
            <div style={{ padding: 14, minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <AnimatePresence onExitComplete={() => addLog("exit animation complete → DOM removed ✓", "enter")}>
                {visible && (
                  <motion.div
                    key="card"
                    style={s.card}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12, scale: 0.96 }}
                    transition={{ duration: dur, ease: "easeInOut" }}
                    onAnimationStart={def => {
                      if (def === "exit") addLog("with AnimatePresence: exit animation running...", "exit");
                      if (def === "animate") addLog("with AnimatePresence: enter animation complete", "enter");
                    }}
                  >
                    <div style={{ color: C.accent, marginBottom: 4 }}>component</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>exit animates smoothly</div>
                    <div style={{ display: "inline-block", background: `${C.green}22`, border: `1px solid ${C.green}55`, borderRadius: 4, padding: "2px 7px", fontSize: 10, color: C.green, marginTop: 6 }}>✓ exit works</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div style={s.label}>// lifecycle log</div>
      <div ref={logRef} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 11, lineHeight: 1.9, maxHeight: 90, overflowY: "auto" }}>
        {logs.map((l, i) => (
          <div key={l.id || i} style={{ display: "flex", gap: 8 }}>
            <span style={{ color: C.muted, minWidth: 52 }}>{String(i).padStart(2, "0")}:</span>
            <span style={{ color: logColor[l.type] || C.text }}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TAB 2: Mode ───────────────────────────────────────────────────────────────
const PAGES = [
  { title: "Home", body: "Welcome! This is the home page content.", color: C.accent, key: "home" },
  { title: "About", body: "Learn more about us and what we do here.", color: C.purple, key: "about" },
  { title: "Contact", body: "Get in touch with us anytime you want.", color: C.green, key: "contact" },
];

const PAGE_VARIANTS = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

function ModeTab() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState("sync");
  const page = PAGES[idx];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <select value={mode} onChange={e => setMode(e.target.value)}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 10px", color: C.yellow, fontSize: 12, fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
          <option value="sync">mode="sync"</option>
          <option value="wait">mode="wait"</option>
          <option value="popLayout">mode="popLayout"</option>
        </select>
        <button style={s.btn()} onClick={() => setIdx(i => (i + PAGES.length - 1) % PAGES.length)}>← prev</button>
        <button style={s.btn()} onClick={() => setIdx(i => (i + 1) % PAGES.length)}>next →</button>
        <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>
          page <span style={{ color: C.text }}>{idx + 1}</span> / {PAGES.length}
        </span>
      </div>

      <div style={s.label}>// page transitions</div>
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <Dots />
          <span style={{ marginLeft: 4 }}>page transition</span>
          <span style={{ marginLeft: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>{mode}</span>
        </div>
        <div style={{ padding: 14, minHeight: 100, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode={mode}>
            <motion.div
              key={page.key}
              variants={PAGE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}
            >
              <div style={{ color: page.color, fontSize: 13, marginBottom: 6 }}>{page.title}</div>
              <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.7 }}>{page.body}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div style={{ height: 10 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { m: "sync", color: C.accent, desc: "exit + enter run simultaneously. Can overlap visually." },
          { m: "wait", color: C.purple, desc: 'exit finishes first, then enter starts. Clean for page transitions.' },
          { m: "popLayout", color: C.yellow, desc: 'Exiting item "pops" out of layout flow immediately.' },
        ].map(({ m, color, desc }) => (
          <div key={m} onClick={() => setMode(m)} style={{ ...s.panel, padding: 12, cursor: "pointer", borderColor: mode === m ? color + "88" : C.border, background: mode === m ? color + "11" : C.surface }}>
            <div style={{ color, fontSize: 11, marginBottom: 6 }}>{m}</div>
            <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TAB 3: Toasts ─────────────────────────────────────────────────────────────
let nextId = 1;

const TOAST_CONFIGS = {
  success: { icon: "✓", color: C.green, label: "Success!", sub: "Changes saved successfully." },
  error:   { icon: "✗", color: C.red,   label: "Error",    sub: "Something went wrong." },
  info:    { icon: "i", color: C.accent, label: "Info",     sub: "Here is some information." },
};

function ToastsTab() {
  const [toasts, setToasts] = useState([]);

  const add = (type) => {
    const id = nextId++;
    const t = { id, type, ...TOAST_CONFIGS[type] };
    setToasts(p => [...p, t]);
    setTimeout(() => remove(id), 4000);
  };

  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button style={s.btn(C.green)} onClick={() => add("success")}>+ success</button>
        <button style={s.btn(C.orange)} onClick={() => add("error")}>+ error</button>
        <button style={s.btn(C.accent)} onClick={() => add("info")}>+ info</button>
        <button style={{ ...s.btn(C.red), marginLeft: "auto" }} onClick={() => setToasts([])}>clear all</button>
      </div>

      <div style={s.label}>// toasts with mode="popLayout"</div>
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <Dots />
          <span style={{ marginLeft: 4 }}>toast notifications</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: C.muted }}>
            {toasts.length} active
          </span>
        </div>
        <div style={{ padding: 14, minHeight: 140 }}>
          <AnimatePresence mode="popLayout">
            {toasts.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 100, color: C.muted, fontSize: 12 }}
              >
                no toasts — add one above
              </motion.div>
            )}
            {toasts.map(t => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "10px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ color: t.color, fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: t.color, fontSize: 12 }}>{t.label}</div>
                  <div style={{ color: C.muted, fontSize: 10 }}>{t.sub}</div>
                </div>
                <button onClick={() => remove(t.id)}
                  style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, fontFamily: "inherit", padding: "0 2px" }}>
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ height: 10 }} />
      <div style={{ ...s.panel, padding: 12 }}>
        <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.8 }}>
          <span style={{ color: C.purple }}>key={"{"}toast.id{"}"}</span>
          {" "}— unique key per toast lets AnimatePresence track each item independently.{" "}
          <span style={{ color: C.purple }}>layout</span>
          {" "}prop animates position when other toasts are added/removed.
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
const TABS = ["basic", "mode", "toasts"];

export default function App() {
  const [tab, setTab] = useState("basic");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'JetBrains Mono','Fira Code',monospace", padding: "24px 22px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.accent }}>AnimatePresence</h1>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>
            framer-motion — анімація mount / unmount компонентів
          </p>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? C.surface : "transparent",
              border: `1px solid ${tab === t ? C.accent + "55" : C.border}`,
              borderRadius: 8, padding: "7px 16px",
              color: tab === t ? C.accent : C.muted,
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>{t}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "basic"  && <BasicTab />}
            {tab === "mode"   && <ModeTab />}
            {tab === "toasts" && <ToastsTab />}
          </motion.div>
        </AnimatePresence>

      </div>
      <style>{`
        * { scrollbar-width: thin; scrollbar-color: ${C.border} transparent; }
        input[type=range] { accent-color: ${C.accent}; }
        select option { background: ${C.surface}; }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
