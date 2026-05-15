import { useState, useMemo, useCallback, createContext, useContext } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", teal: "#1abc9c",
  muted: "#565f89", text: "#c0caf5",
  red: "#ff5f57",
};

// ── token helpers ─────────────────────────────────────────────────────────────
const Kw = ({ c }) => <span style={{ color: C.purple }}>{c}</span>;
const Fn = ({ c }) => <span style={{ color: C.accent }}>{c}</span>;
const Str = ({ c }) => <span style={{ color: C.green }}>{c}</span>;
const Cm = ({ c }) => <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>;
const Tx = ({ c }) => <span style={{ color: C.text }}>{c}</span>;
const Ty = ({ c }) => <span style={{ color: C.yellow }}>{c}</span>;

function CodeLine({ ln, children, dim }) {
  return (
    <div style={{ display: "flex", gap: 12, lineHeight: "1.8", opacity: dim ? 0.4 : 1 }}>
      <span style={{ color: "#2a2c4a", minWidth: 20, textAlign: "right", fontSize: 10, userSelect: "none", flexShrink: 0 }}>{ln}</span>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono','Fira Code',monospace", whiteSpace: "pre" }}>{children}</span>
    </div>
  );
}

function SectionLabel({ color, children }) {
  return (
    <div style={{ color, fontSize: 10, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — Context
// ═══════════════════════════════════════════════════════════════════

const BadCtx = createContext(null);
const GoodUserCtx = createContext(null);
const GoodCartCtx = createContext(null);

let renderLog = [];

function BadConsumerUser() {
  const ctx = useContext(BadCtx);
  renderLog.push("UserBadge");
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.red}44`, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: C.text }}>
      👤 {ctx.user} <span style={{ color: C.red, fontSize: 9 }}>← ре-рендер!</span>
    </div>
  );
}
function BadConsumerCart() {
  const ctx = useContext(BadCtx);
  renderLog.push("CartBadge");
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.red}44`, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: C.text }}>
      🛒 {ctx.cart} items <span style={{ color: C.red, fontSize: 9 }}>← ре-рендер!</span>
    </div>
  );
}

function GoodConsumerUser() {
  const { user } = useContext(GoodUserCtx);
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.green}44`, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: C.text }}>
      👤 {user} <span style={{ color: C.green, fontSize: 9 }}>✓ без ре-рендеру</span>
    </div>
  );
}
function GoodConsumerCart() {
  const { cart } = useContext(GoodCartCtx);
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.green}44`, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: C.text }}>
      🛒 {cart} items <span style={{ color: C.green, fontSize: 9 }}>✓ тільки цей</span>
    </div>
  );
}

function TabContext() {
  const [cart, setCart] = useState(3);
  const [log, setLog] = useState([]);
  const [mode, setMode] = useState("bad");

  const addToCart = () => {
    const newCart = cart + 1;
    setCart(newCart);
    if (mode === "bad") {
      setLog(p => [...p, { text: "cart змінився → UserBadge + CartBadge ре-рендеряться", color: C.red }]);
    } else {
      setLog(p => [...p, { text: "cart змінився → тільки CartBadge ре-рендерився", color: C.green }]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[["bad", "один Context ❌", C.red], ["good", "розбитий Context ✅", C.green]].map(([id, label, color]) => (
          <button key={id} onClick={() => { setMode(id); setLog([]); setCart(3); }} style={{
            flex: 1, padding: "7px 0",
            background: mode === id ? color + "22" : "transparent",
            border: `1px solid ${mode === id ? color : C.border}`,
            borderRadius: 7, color: mode === id ? color : C.muted,
            fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {mode === "bad" ? (
        <BadCtx.Provider value={{ user: "Anna", cart }}>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <CodeLine ln="1"><Cm c="// один об'єкт — всі споживачі ре-рендеряться" /></CodeLine>
            <CodeLine ln="2"><Kw c="const" /><Tx c=" ctx = { user, theme, " /><span style={{ color: C.orange }}>cart</span><Tx c=" };" /></CodeLine>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <BadConsumerUser />
            <BadConsumerCart />
          </div>
        </BadCtx.Provider>
      ) : (
        <GoodUserCtx.Provider value={{ user: "Anna" }}>
          <GoodCartCtx.Provider value={{ cart }}>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <CodeLine ln="1"><Cm c="// окремі контексти — ре-рендер тільки там де треба" /></CodeLine>
              <CodeLine ln="2"><Kw c="const" /><Ty c=" UserCtx" /><Tx c=" = " /><Fn c="createContext" /><Tx c="(null);" /></CodeLine>
              <CodeLine ln="3"><Kw c="const" /><Ty c=" CartCtx" /><Tx c=" = " /><Fn c="createContext" /><Tx c="(null);" /></CodeLine>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <GoodConsumerUser />
              <GoodConsumerCart />
            </div>
          </GoodCartCtx.Provider>
        </GoodUserCtx.Provider>
      )}

      <button onClick={addToCart} style={{
        background: C.surface2, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "8px 0", color: C.accent,
        fontSize: 12, cursor: "pointer", fontFamily: "inherit",
      }}>
        + Додати в кошик (cart: {cart})
      </button>

      {log.length > 0 && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", maxHeight: 100, overflowY: "auto" }}>
          {log.slice(-4).map((l, i) => (
            <div key={i} style={{ fontSize: 10, color: l.color, lineHeight: 1.8 }}>→ {l.text}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — useMemo
// ═══════════════════════════════════════════════════════════════════

const PRODUCTS = Array.from({ length: 200 }, (_, i) => ({
  id: i, name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 500) + 10,
  active: Math.random() > 0.4,
}));

function TabMemo() {
  const [mode, setMode] = useState("bad");
  const [tick, setTick] = useState(0);
  const [times, setTimes] = useState([]);

  const runFilter = () => {
    const t0 = performance.now();
    let result;
    if (mode === "bad") {
      // simulate without memo — runs every render
      for (let r = 0; r < 50; r++) {
        result = PRODUCTS.filter(p => p.active).sort((a, b) => b.price - a.price);
      }
    } else {
      result = PRODUCTS.filter(p => p.active).sort((a, b) => b.price - a.price);
    }
    const t1 = performance.now();
    const ms = (t1 - t0).toFixed(2);
    setTimes(p => [...p.slice(-5), { ms, mode }]);
    setTick(t => t + 1);
  };

  const avg = times.length
    ? (times.reduce((a, t) => a + parseFloat(t.ms), 0) / times.length).toFixed(2)
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[["bad", "без useMemo ❌", C.red], ["good", "з useMemo ✅", C.green]].map(([id, label, color]) => (
          <button key={id} onClick={() => { setMode(id); setTimes([]); }} style={{
            flex: 1, padding: "7px 0",
            background: mode === id ? color + "22" : "transparent",
            border: `1px solid ${mode === id ? color : C.border}`,
            borderRadius: 7, color: mode === id ? color : C.muted,
            fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
        {mode === "bad" ? (<>
          <CodeLine ln="1"><Cm c="// ❌ запускається при кожному рендері" /></CodeLine>
          <CodeLine ln="2"><Kw c="const" /><Tx c=" filtered = products" /></CodeLine>
          <CodeLine ln="3"><Tx c="  ." /><Fn c="filter" /><Tx c="(p => p.active)" /></CodeLine>
          <CodeLine ln="4"><Tx c="  ." /><Fn c="sort" /><Tx c="((a, b) => b.price - a.price);" /></CodeLine>
        </>) : (<>
          <CodeLine ln="1"><Cm c="// ✅ тільки коли products змінились" /></CodeLine>
          <CodeLine ln="2"><Kw c="const" /><Tx c=" filtered = " /><Fn c="useMemo" /><Tx c="(() =>" /></CodeLine>
          <CodeLine ln="3"><Tx c="  products." /><Fn c="filter" /><Tx c="(p => p.active)" /></CodeLine>
          <CodeLine ln="4"><Tx c="    ." /><Fn c="sort" /><Tx c="((a, b) => b.price - a.price)," /></CodeLine>
          <CodeLine ln="5"><Tx c="  [products]);" /></CodeLine>
        </>)}
      </div>

      <button onClick={runFilter} style={{
        background: C.surface2, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "8px 0", color: C.accent,
        fontSize: 12, cursor: "pointer", fontFamily: "inherit",
      }}>
        ▶ Запустити фільтрацію (200 елементів × {mode === "bad" ? "50 разів" : "1 раз"})
      </button>

      {times.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ color: C.muted, fontSize: 10 }}>// результати</div>
          {times.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                height: 6, borderRadius: 3,
                background: t.mode === "bad" ? C.red : C.green,
                width: `${Math.min(parseFloat(t.ms) * 4, 100)}%`,
                transition: "width 0.3s",
                maxWidth: "60%",
              }} />
              <span style={{ color: t.mode === "bad" ? C.red : C.green, fontSize: 11 }}>{t.ms}ms</span>
            </div>
          ))}
          {times.length > 1 && (
            <div style={{ color: C.muted, fontSize: 10 }}>середнє: {avg}ms</div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3 — Virtualization
// ═══════════════════════════════════════════════════════════════════

const ITEMS = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Item #${i + 1}` }));
const ITEM_H = 36;
const VISIBLE_H = 200;

function TabVirtualize() {
  const [mode, setMode] = useState("bad");
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / ITEM_H);
  const visibleCount = Math.ceil(VISIBLE_H / ITEM_H) + 1;
  const visibleItems = ITEMS.slice(visibleStart, visibleStart + visibleCount);
  const totalHeight = ITEMS.length * ITEM_H;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[["bad", "рендер всіх 1000 ❌", C.red], ["good", "react-window ✅", C.green]].map(([id, label, color]) => (
          <button key={id} onClick={() => { setMode(id); setScrollTop(0); }} style={{
            flex: 1, padding: "7px 0",
            background: mode === id ? color + "22" : "transparent",
            border: `1px solid ${mode === id ? color : C.border}`,
            borderRadius: 7, color: mode === id ? color : C.muted,
            fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
        {mode === "bad" ? (<>
          <CodeLine ln="1"><Cm c="// ❌ рендерить всі 1000 елементів" /></CodeLine>
          <CodeLine ln="2"><Tx c="{items." /><Fn c="map" /><Tx c="(item => (" /></CodeLine>
          <CodeLine ln="3"><Tx c="  <" /><Ty c="Row" /><Tx c=" key={item.id} item={item} />" /></CodeLine>
          <CodeLine ln="4"><Tx c="))}" /></CodeLine>
        </>) : (<>
          <CodeLine ln="1"><Cm c="// ✅ рендерить тільки видимі" /></CodeLine>
          <CodeLine ln="2"><Tx c="<" /><Ty c="FixedSizeList" /></CodeLine>
          <CodeLine ln="3"><Tx c="  height={600} itemCount={1000} itemSize={50}" /></CodeLine>
          <CodeLine ln="4"><Tx c=">" /></CodeLine>
          <CodeLine ln="5"><Tx c="  {({ index, style }) => <" /><Ty c="Row" /><Tx c=" style={style} />}" /></CodeLine>
          <CodeLine ln="6"><Tx c="</" /><Ty c="FixedSizeList" /><Tx c=">" /></CodeLine>
        </>)}
      </div>

      {mode === "bad" ? (
        <div>
          <div style={{ color: C.muted, fontSize: 10, marginBottom: 6 }}>
            рендерить <span style={{ color: C.red }}>1000</span> DOM елементів одразу
          </div>
          <div style={{
            height: VISIBLE_H, overflowY: "auto", border: `1px solid ${C.border}`,
            borderRadius: 8, background: C.bg,
          }}>
            {ITEMS.map(item => (
              <div key={item.id} style={{
                height: ITEM_H, display: "flex", alignItems: "center",
                padding: "0 12px", borderBottom: `1px solid ${C.border}22`,
                fontSize: 11, color: item.id % 5 === 0 ? C.accent : C.muted,
              }}>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ color: C.muted, fontSize: 10, marginBottom: 6 }}>
            рендерить тільки <span style={{ color: C.green }}>~{visibleCount}</span> видимих з 1000
          </div>
          <div
            style={{ height: VISIBLE_H, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 8, background: C.bg, position: "relative" }}
            onScroll={e => setScrollTop(e.target.scrollTop)}
          >
            <div style={{ height: totalHeight, position: "relative" }}>
              {visibleItems.map(item => (
                <div key={item.id} style={{
                  position: "absolute",
                  top: item.id * ITEM_H,
                  left: 0, right: 0,
                  height: ITEM_H, display: "flex", alignItems: "center",
                  padding: "0 12px", borderBottom: `1px solid ${C.border}22`,
                  fontSize: 11, color: item.id % 5 === 0 ? C.green : C.muted,
                }}>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: mode === "bad" ? C.red + "12" : C.green + "12",
        border: `1px solid ${mode === "bad" ? C.red : C.green}33`,
        borderRadius: 8, padding: "8px 12px",
        fontSize: 11, color: mode === "bad" ? C.red : C.green,
        transition: "all 0.2s",
      }}>
        {mode === "bad"
          ? "⚠ 1000 DOM вузлів у пам'яті — скрол лагає на слабких пристроях"
          : "✓ ~7 DOM вузлів у пам'яті — скрол плавний навіть на 100 000 елементів"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════════════════════════

const tabs = [
  { id: "context", label: "Context", color: C.purple },
  { id: "memo",    label: "useMemo", color: C.accent },
  { id: "virt",    label: "Virtualize", color: C.teal },
];

export default function ReactPerformanceDemo() {
  const [active, setActive] = useState("context");

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 640 }}>

        {/* titlebar */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderBottom: "none", borderRadius: "14px 14px 0 0",
          padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[C.red, "#ffbd2e", "#28c840"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ color: C.muted, fontSize: 11 }}>performance.tsx — React</span>
          <span style={{ color: C.muted, fontSize: 10 }}>@nby.frontend</span>
        </div>

        {/* tabs */}
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderTop: `1px solid ${C.border}`, borderBottom: "none", display: "flex",
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              flex: 1, padding: "9px 4px",
              background: active === t.id ? C.surface : "transparent",
              border: "none",
              borderBottom: `2px solid ${active === t.id ? t.color : "transparent"}`,
              color: active === t.id ? t.color : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* content */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderTop: "none", borderRadius: "0 0 14px 14px", padding: "16px",
        }}>
          {active === "context" && <TabContext />}
          {active === "memo"    && <TabMemo />}
          {active === "virt"    && <TabVirtualize />}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10,
          background: C.orange + "12", border: `1px solid ${C.orange}33`,
          borderRadius: 8, padding: "8px 14px",
          fontSize: 11, color: C.orange, textAlign: "center",
        }}>
          💡 React DevTools → Profiler → запиши сесію → побачиш де реально втрачаєш ms
        </div>

      </div>
    </div>
  );
}
