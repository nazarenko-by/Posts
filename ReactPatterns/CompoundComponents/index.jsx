import { useState, createContext, useContext } from "react";

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

// ── Modal Context ─────────────────────────────────────────────────────────────
const ModalContext = createContext(null);

function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within Modal");
  return ctx;
}

// ── Modal compound component ──────────────────────────────────────────────────
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <ModalContext.Provider value={{ open, onClose }}>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, width: 340, maxWidth: "92vw",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

Modal.Header = function ModalHeader({ children }) {
  const { onClose } = useModal();
  return (
    <div style={{
      padding: "16px 20px 12px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{children}</div>
      <button onClick={onClose} style={{
        background: "transparent", border: "none",
        color: C.muted, fontSize: 16, cursor: "pointer",
        lineHeight: 1, padding: "2px 6px", borderRadius: 4,
      }}>{"×"}</button>
    </div>
  );
};

Modal.Body = function ModalBody({ children }) {
  return (
    <div style={{ padding: "14px 20px", fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({ children }) {
  return (
    <div style={{
      padding: "12px 20px 16px",
      borderTop: `1px solid ${C.border}`,
      display: "flex", justifyContent: "flex-end", gap: 8,
    }}>
      {children}
    </div>
  );
};

Modal.Close = function ModalClose({ children, variant = "ghost" }) {
  const { onClose } = useModal();
  const styles = {
    ghost:   { background: "transparent", color: C.muted,   border: `1px solid ${C.border}` },
    danger:  { background: C.red + "22",  color: C.red,     border: `1px solid ${C.red}55` },
    primary: { background: C.accent,      color: C.bg,      border: "none" },
  };
  return (
    <button onClick={onClose} style={{
      ...(styles[variant] || styles.ghost),
      borderRadius: 8, padding: "7px 16px",
      fontSize: 12, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit",
    }}>
      {children}
    </button>
  );
};

// ── Demo Button ───────────────────────────────────────────────────────────────
function Btn({ onClick, children, variant = "primary", style = {} }) {
  const s = {
    primary: { background: C.accent,      color: C.bg,    border: "none" },
    outline: { background: "transparent", color: C.accent, border: `1px solid ${C.accent}55` },
    ghost:   { background: "transparent", color: C.muted,  border: `1px solid ${C.border}` },
    danger:  { background: C.red + "22",  color: C.red,   border: `1px solid ${C.red}55` },
  }[variant];
  return (
    <button onClick={onClick} style={{
      ...s, borderRadius: 8, padding: "7px 16px",
      fontSize: 12, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit", ...style,
    }}>
      {children}
    </button>
  );
}

// ── Context debug overlay ─────────────────────────────────────────────────────
function ContextBadge({ label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: C.surface2, borderRadius: 6,
      padding: "4px 10px", fontSize: 10,
    }}>
      <span style={{ color: C.muted }}>{label}:</span>
      <span style={{ color, fontWeight: 700 }}>{String(value)}</span>
    </div>
  );
}

// ── Demo tab ──────────────────────────────────────────────────────────────────
function DemoTab() {
  const [which, setWhich] = useState(null);

  const modals = [
    {
      id: "confirm",
      label: "Confirm Dialog",
      color: C.accent,
      render: (close) => (
        <Modal open onClose={close}>
          <Modal.Header>Зберегти зміни?</Modal.Header>
          <Modal.Body>
            Всі незбережені зміни будуть втрачені.
            Ти впевнений що хочеш продовжити?
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close variant="ghost">Скасувати</Modal.Close>
            <Btn onClick={close}>Зберегти</Btn>
          </Modal.Footer>
        </Modal>
      ),
    },
    {
      id: "delete",
      label: "Delete Dialog",
      color: C.red,
      render: (close) => (
        <Modal open onClose={close}>
          <Modal.Header>Видалити акаунт?</Modal.Header>
          <Modal.Body>
            Ця дія незворотна. Всі твої дані
            будуть видалені назавжди.
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close variant="ghost">Скасувати</Modal.Close>
            <Modal.Close variant="danger">Видалити</Modal.Close>
          </Modal.Footer>
        </Modal>
      ),
    },
    {
      id: "info",
      label: "Info Modal",
      color: C.teal,
      render: (close) => (
        <Modal open onClose={close}>
          <Modal.Header>React Patterns #1</Modal.Header>
          <Modal.Body>
            Compound components — це патерн де
            батьківський компонент тримає стан через Context,
            а підкомпоненти читають його без prop drilling.
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close variant="primary">Зрозумів!</Modal.Close>
          </Modal.Footer>
        </Modal>
      ),
    },
  ];

  const active = modals.find(m => m.id === which);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* context state */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <ContextBadge label="ModalContext" value={which ? "active" : "null"} color={which ? C.green : C.muted} />
        <ContextBadge label="open" value={!!which} color={which ? C.green : C.muted} />
      </div>

      {/* modal triggers */}
      <div style={{ fontSize: 10, color: C.muted }}>{"// три різні Modal з одного компонента:"}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {modals.map(m => (
          <Btn key={m.id} onClick={() => setWhich(m.id)} variant="outline" style={{ borderColor: m.color + "55", color: m.color }}>
            {m.label}
          </Btn>
        ))}
      </div>

      {/* compound API preview */}
      <div style={{
        background: C.surface2, borderRadius: 8,
        padding: "10px 12px", fontSize: 11,
        color: C.muted, lineHeight: 1.8,
        borderLeft: `2px solid ${C.teal}`,
      }}>
        <div style={{ color: C.teal, fontWeight: 600, marginBottom: 4, fontSize: 10 }}>
          {"// compound API — читається як HTML:"}
        </div>
        <div><span style={{ color: C.green }}>{"<Modal"}</span><span style={{ color: C.accent }}>{" open"}</span><span style={{ color: C.green }}>{">"}</span></div>
        <div style={{ paddingLeft: 14 }}><span style={{ color: C.green }}>{"<Modal.Header>"}</span><span style={{ color: C.text }}>Заголовок</span><span style={{ color: C.green }}>{"</Modal.Header>"}</span></div>
        <div style={{ paddingLeft: 14 }}><span style={{ color: C.green }}>{"<Modal.Body>"}</span><span style={{ color: C.text }}>Контент</span><span style={{ color: C.green }}>{"</Modal.Body>"}</span></div>
        <div style={{ paddingLeft: 14 }}><span style={{ color: C.green }}>{"<Modal.Footer>"}</span><span style={{ color: C.text }}>Кнопки</span><span style={{ color: C.green }}>{"</Modal.Footer>"}</span></div>
        <div><span style={{ color: C.green }}>{"</Modal>"}</span></div>
      </div>

      {/* render active modal */}
      {active && active.render(() => setWhich(null))}
    </div>
  );
}

// ── Code tab ──────────────────────────────────────────────────────────────────
function CodeTab() {
  const [section, setSection] = useState("context");
  const sections = [
    { id: "context", label: "Context" },
    { id: "sub",     label: "Sub-components" },
    { id: "usage",   label: "Usage" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            flex: 1, padding: "5px 4px", fontSize: 10,
            background: section === s.id ? C.surface2 : "transparent",
            border: `1px solid ${section === s.id ? C.accent + "55" : C.border}`,
            borderRadius: 6, color: section === s.id ? C.accent : C.muted,
            cursor: "pointer", fontFamily: "inherit",
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 8px" }}>
        {section === "context" && <>
          <CodeLine ln="1"><Cm c="// 1. створюємо Context для спільного стану" /></CodeLine>
          <CodeLine ln="2"><Kw c="const" /><Tx c=" ModalContext = " /><Fn c="createContext" /><Tx c="(null)" /></CodeLine>
          <CodeLine ln="3"><Tx c="" /></CodeLine>
          <CodeLine ln="4" highlight><Kw c="function" /><Fn c=" Modal" /><Tx c="({ open, onClose, children }) {" /></CodeLine>
          <CodeLine ln="5" highlight><Kw c="  return" /><Tx c=" (" /></CodeLine>
          <CodeLine ln="6" highlight><Tx c="    " /><Ty c="<ModalContext.Provider" /><Tx c=" value={{ open, onClose }}>" /></CodeLine>
          <CodeLine ln="7"><Tx c="      {open " /><Tx c="&& " /><Tx c="<div " /><Fn c="className" /><Tx c={'="modal"'} /><Tx c={">{children}</div>}"} /></CodeLine>
          <CodeLine ln="8" highlight><Tx c="    " /><Ty c="</ModalContext.Provider>" /></CodeLine>
          <CodeLine ln="9"><Tx c="  )" /></CodeLine>
          <CodeLine ln="10"><Tx c="}" /></CodeLine>
          <CodeLine ln="11"><Tx c="" /></CodeLine>
          <CodeLine ln="12"><Cm c="// хук для підкомпонентів" /></CodeLine>
          <CodeLine ln="13"><Kw c="function" /><Fn c=" useModal" /><Tx c="() {" /></CodeLine>
          <CodeLine ln="14"><Kw c="  return" /><Fn c=" useContext" /><Tx c="(ModalContext)" /></CodeLine>
          <CodeLine ln="15"><Tx c="}" /></CodeLine>
        </>}

        {section === "sub" && <>
          <CodeLine ln="1"><Cm c="// підкомпоненти — властивості батьківського" /></CodeLine>
          <CodeLine ln="2"><Tx c="Modal." /><Fn c="Header" /><Tx c=" = " /><Kw c="function" /><Tx c="({ children }) {" /></CodeLine>
          <CodeLine ln="3"><Kw c="  return" /><Tx c=" <div " /><Fn c="className" /><Tx c={'="modal-header"'} /><Tx c={">{children}</div>"} /></CodeLine>
          <CodeLine ln="4"><Tx c="}" /></CodeLine>
          <CodeLine ln="5"><Tx c="" /></CodeLine>
          <CodeLine ln="6" highlight><Tx c="Modal." /><Fn c="Close" /><Tx c=" = " /><Kw c="function" /><Tx c="({ children }) {" /></CodeLine>
          <CodeLine ln="7" highlight><Kw c="  const" /><Tx c=" { onClose } = " /><Fn c="useModal" /><Tx c="()" /><Cm c="  // читає Context" /></CodeLine>
          <CodeLine ln="8" highlight><Kw c="  return" /><Tx c=" <button " /><Fn c="onClick" /><Tx c={"={onClose}>{children}</button>"} /></CodeLine>
          <CodeLine ln="9"><Tx c="}" /></CodeLine>
          <CodeLine ln="10"><Tx c="" /></CodeLine>
          <CodeLine ln="11"><Cm c="// Modal.Body, Modal.Footer — аналогічно" /></CodeLine>
        </>}

        {section === "usage" && <>
          <CodeLine ln="1"><Cm c="// ✅ читається як HTML, без prop drilling" /></CodeLine>
          <CodeLine ln="2"><Ty c="<Modal" /><Tx c=" open={open} " /><Fn c="onClose" /><Tx c={"={close}>"} /></CodeLine>
          <CodeLine ln="3"><Ty c="  <Modal.Header>" /><Tx c="Зберегти зміни?" /><Ty c="</Modal.Header>" /></CodeLine>
          <CodeLine ln="4"><Ty c="  <Modal.Body>" /></CodeLine>
          <CodeLine ln="5"><Tx c="    Незбережені зміни буде втрачено." /></CodeLine>
          <CodeLine ln="6"><Ty c="  </Modal.Body>" /></CodeLine>
          <CodeLine ln="7" highlight><Ty c="  <Modal.Footer>" /></CodeLine>
          <CodeLine ln="8" highlight><Ty c="    <Modal.Close>" /><Tx c="Скасувати" /><Ty c="</Modal.Close>" /></CodeLine>
          <CodeLine ln="9" highlight><Cm c="    {/* onClose з Context — автоматично */}" /></CodeLine>
          <CodeLine ln="10" highlight><Ty c="  </Modal.Footer>" /></CodeLine>
          <CodeLine ln="11"><Ty c="</Modal>" /></CodeLine>
        </>}
      </div>
    </div>
  );
}

// ── Before/After tab ──────────────────────────────────────────────────────────
function BeforeAfterTab() {
  const [view, setView] = useState("before");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { id: "before", label: "❌ Props API", color: C.red },
          { id: "after",  label: "✅ Compound API", color: C.green },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} style={{
            flex: 1, padding: "7px 4px", fontSize: 11,
            background: view === v.id ? C.surface2 : "transparent",
            border: `1px solid ${view === v.id ? v.color + "88" : C.border}`,
            borderRadius: 8, color: view === v.id ? v.color : C.muted,
            cursor: "pointer", fontFamily: "inherit",
          }}>{v.label}</button>
        ))}
      </div>

      <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 8px" }}>
        {view === "before" ? <>
          <CodeLine ln="1"><Cm c="// ❌ props API — важко читати і розширювати" /></CodeLine>
          <CodeLine ln="2" dim><Ty c="<Modal" /></CodeLine>
          <CodeLine ln="3" dim><Fn c="  isOpen" /><Tx c={"={open}"} /></CodeLine>
          <CodeLine ln="4" dim><Fn c="  onClose" /><Tx c={"={close}"} /></CodeLine>
          <CodeLine ln="5" dim><Fn c="  title" /><Tx c={'="Зберегти зміни?"'} /></CodeLine>
          <CodeLine ln="6" dim><Fn c="  description" /><Tx c={'="Зміни будуть втрачені"'} /></CodeLine>
          <CodeLine ln="7" dim><Fn c="  showFooter" /><Tx c={"={true}"} /></CodeLine>
          <CodeLine ln="8" dim><Fn c="  footerAlign" /><Tx c={'="right"'} /></CodeLine>
          <CodeLine ln="9" dim><Fn c="  primaryLabel" /><Tx c={'="Зберегти"'} /></CodeLine>
          <CodeLine ln="10" dim><Fn c="  onPrimary" /><Tx c={"={handleSave}"} /></CodeLine>
          <CodeLine ln="11" dim><Fn c="  secondaryLabel" /><Tx c={'="Скасувати"'} /></CodeLine>
          <CodeLine ln="12" dim><Fn c="  onSecondary" /><Tx c={"={close}"} /></CodeLine>
          <CodeLine ln="13" dim><Ty c="/>" /></CodeLine>
          <CodeLine ln="14"><Cm c="// 11 пропсів — і це ще простий випадок" /></CodeLine>
        </> : <>
          <CodeLine ln="1"><Cm c="// ✅ compound API — гнучко і читабельно" /></CodeLine>
          <CodeLine ln="2"><Ty c="<Modal" /><Tx c=" open={open} " /><Fn c="onClose" /><Tx c={"={close}>"} /></CodeLine>
          <CodeLine ln="3" highlight><Ty c="  <Modal.Header>" /><Tx c="Зберегти зміни?" /><Ty c="</Modal.Header>" /></CodeLine>
          <CodeLine ln="4" highlight><Ty c="  <Modal.Body>" /><Tx c="Зміни будуть втрачені" /><Ty c="</Modal.Body>" /></CodeLine>
          <CodeLine ln="5" highlight><Ty c="  <Modal.Footer>" /></CodeLine>
          <CodeLine ln="6" highlight><Ty c="    <Modal.Close>" /><Tx c="Скасувати" /><Ty c="</Modal.Close>" /></CodeLine>
          <CodeLine ln="7" highlight><Tx c="    <Button " /><Fn c="onClick" /><Tx c={"={handleSave}>Зберегти</Button>"} /></CodeLine>
          <CodeLine ln="8" highlight><Ty c="  </Modal.Footer>" /></CodeLine>
          <CodeLine ln="9"><Ty c="</Modal>" /></CodeLine>
          <CodeLine ln="10"><Cm c="// 2 пропси на Modal, решта — структура" /></CodeLine>
        </>}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("demo");

  const tabs = [
    { id: "demo",       label: "Demo",       color: C.teal },
    { id: "code",       label: "Код",        color: C.purple },
    { id: "beforeafter", label: "До / Після", color: C.accent },
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
            <span style={{ color: C.muted, fontSize: 11 }}>Modal.tsx</span>
            <span style={{ background: C.purple + "22", color: C.purple, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              React Patterns #1
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
          padding: "20px 16px", minHeight: 320,
        }}>
          {tab === "demo"        && <DemoTab />}
          {tab === "code"        && <CodeTab />}
          {tab === "beforeafter" && <BeforeAfterTab />}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          {"💡 Context тримає стан — підкомпоненти читають без prop drilling"}
        </div>

      </div>
    </div>
  );
}
