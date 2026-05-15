import { useState, useCallback, useMemo, useRef, memo, useEffect } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

const AVATARS = ["🧑‍💻", "👩‍🎨", "🧑‍🔬"];
const USERS = [
  { id: 1, name: "Alice", role: "Frontend" },
  { id: 2, name: "Bob",   role: "Design"   },
  { id: 3, name: "Carol", role: "Backend"  },
];

// ── render counter — no useState, no loops ────────────────────────────────
// We count renders via ref only. Flash is a CSS animation triggered
// by changing the `key` on the flash element — zero extra re-renders.
function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// ── Node ───────────────────────────────────────────────────────────────────
function Node({ name, sub, renderCount, bad }) {
  const color = bad ? C.red : C.green;
  // Each render gets a new key → CSS animation restarts → flash effect
  return (
    <div style={{
      position: "relative",
      padding: "8px 16px",
      borderRadius: 8,
      background: C.surface2,
      border: `2px solid ${C.border}`,
      textAlign: "center",
      minWidth: 100,
    }}>
      {/* flash overlay — CSS animation on key change */}
      <div
        key={renderCount}
        style={{
          position: "absolute", inset: 0, borderRadius: 6,
          background: color,
          opacity: 0,
          animation: "nodeflash 0.45s ease-out forwards",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", fontSize: 12, color: C.text, fontFamily: "monospace", fontWeight: 700 }}>
        {name}
      </div>
      {sub && (
        <div style={{ position: "relative", fontSize: 10, color: C.muted, marginTop: 1 }}>{sub}</div>
      )}

      {/* counter badge */}
      <div style={{
        position: "absolute", top: -11, right: -11,
        width: 22, height: 22, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#111827",
        border: `2px solid ${color}`,
        fontSize: 10, fontFamily: "monospace", fontWeight: 700,
        color: color,
        zIndex: 1,
      }}>
        {renderCount}
      </div>
    </div>
  );
}

// ── Tree helpers ───────────────────────────────────────────────────────────
const VLine = () => <div style={{ width: 2, height: 14, background: C.border, margin: "0 auto" }} />;

function TreeRow({ children }) {
  return (
    <div style={{ position: "relative", display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-start" }}>
      {children.length > 1 && (
        <div style={{
          position: "absolute", top: 0,
          left: "15%", right: "15%",
          height: 2, background: C.border,
        }} />
      )}
      {children.map((child, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <VLine />
          {child}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 1 — Search / inline props
// ══════════════════════════════════════════════════════════════════════════

function BadSearchInput({ query, onChange }) {
  const count = useRenderCount();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <Node name="SearchInput" renderCount={count} bad />
      <input value={query} onChange={e => onChange(e.target.value)} placeholder="пиши тут..."
        style={{ width: 110, background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 12, fontFamily: "monospace", outline: "none" }} />
    </div>
  );
}

function BadResultItem({ user }) {
  const count = useRenderCount();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Node name="ResultItem" sub={user.name} renderCount={count} bad />
      <div style={{ padding: "6px 10px", borderRadius: 7, background: C.surface, border: `1px solid ${C.border}`, textAlign: "center", minWidth: 80 }}>
        <div style={{ fontSize: 18 }}>{AVATARS[user.id - 1]}</div>
        <div style={{ fontSize: 10, color: C.text, fontFamily: "monospace" }}>{user.name}</div>
      </div>
    </div>
  );
}

function BadSearchScene() {
  const count = useRenderCount();
  const [query, setQuery] = useState("");
  const filtered = USERS.filter(u => u.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Node name="App" renderCount={count} bad />
      <TreeRow>
        {[
          <BadSearchInput key="s" query={query} onChange={setQuery} />,
          ...filtered.map(u => <BadResultItem key={u.id} user={u} />),
        ]}
      </TreeRow>
    </div>
  );
}

const GoodSearchInput = memo(function GoodSearchInput({ query, onChange }) {
  const count = useRenderCount();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <Node name="SearchInput" renderCount={count} bad={false} />
      <input value={query} onChange={e => onChange(e.target.value)} placeholder="пиши тут..."
        style={{ width: 110, background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 12, fontFamily: "monospace", outline: "none" }} />
    </div>
  );
});

const GoodResultItem = memo(function GoodResultItem({ user }) {
  const count = useRenderCount();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Node name="ResultItem" sub={user.name} renderCount={count} bad={false} />
      <div style={{ padding: "6px 10px", borderRadius: 7, background: C.surface, border: `1px solid ${C.border}`, textAlign: "center", minWidth: 80 }}>
        <div style={{ fontSize: 18 }}>{AVATARS[user.id - 1]}</div>
        <div style={{ fontSize: 10, color: C.text, fontFamily: "monospace" }}>{user.name}</div>
      </div>
    </div>
  );
});

function GoodSearchScene() {
  const count = useRenderCount();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => USERS.filter(u => u.name.toLowerCase().includes(query.toLowerCase())), [query]);
  const onChange = useCallback((v) => setQuery(v), []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Node name="App" renderCount={count} bad={false} />
      <TreeRow>
        {[
          <GoodSearchInput key="s" query={query} onChange={onChange} />,
          ...filtered.map(u => <GoodResultItem key={u.id} user={u} />),
        ]}
      </TreeRow>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SCENARIO 2 — Select / state too high
// ══════════════════════════════════════════════════════════════════════════

function BadUserCard({ user, selected, onSelect }) {
  const count = useRenderCount();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Node name="UserCard" sub={user.name} renderCount={count} bad />
      <div onClick={() => onSelect(user.id)} style={{
        padding: "6px 10px", borderRadius: 7, cursor: "pointer", minWidth: 80, textAlign: "center",
        background: selected === user.id ? C.red + "22" : C.surface,
        border: `1px solid ${selected === user.id ? C.red : C.border}`,
        transition: "all 0.15s",
      }}>
        <div style={{ fontSize: 18 }}>{AVATARS[user.id - 1]}</div>
        <div style={{ fontSize: 10, color: C.text, fontFamily: "monospace" }}>{user.name}</div>
      </div>
    </div>
  );
}

function BadSelectScene() {
  const count = useRenderCount();
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Node name="App" renderCount={count} bad />
      <TreeRow>
        {USERS.map(u => <BadUserCard key={u.id} user={u} selected={selected} onSelect={setSelected} />)}
      </TreeRow>
    </div>
  );
}

const GoodUserCard = memo(function GoodUserCard({ user, isSelected, onSelect }) {
  const count = useRenderCount();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Node name="UserCard" sub={user.name} renderCount={count} bad={false} />
      <div onClick={() => onSelect(user.id)} style={{
        padding: "6px 10px", borderRadius: 7, cursor: "pointer", minWidth: 80, textAlign: "center",
        background: isSelected ? C.green + "22" : C.surface,
        border: `1px solid ${isSelected ? C.green : C.border}`,
        transition: "all 0.15s",
      }}>
        <div style={{ fontSize: 18 }}>{AVATARS[user.id - 1]}</div>
        <div style={{ fontSize: 10, color: C.text, fontFamily: "monospace" }}>{user.name}</div>
      </div>
    </div>
  );
});

function GoodSelectScene() {
  const count = useRenderCount();
  const [selected, setSelected] = useState(null);
  const onSelect = useCallback((id) => setSelected(id), []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Node name="App" renderCount={count} bad={false} />
      <TreeRow>
        {USERS.map(u => (
          <GoodUserCard
            key={u.id}
            user={u}
            isSelected={selected === u.id}  // boolean — тільки вибрана картка отримує true
            onSelect={onSelect}
          />
        ))}
      </TreeRow>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TABS + MAIN
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  {
    id: "search", label: "#1 inline props", color: C.orange,
    hint: "пиши в поле — зліва блимають всі, справа тільки SearchInput",
    badLabel: "❌ inline об'єкти та функції в props",
    goodLabel: "✅ memo + useCallback + useMemo",
    bad: <BadSearchScene />, good: <GoodSearchScene />,
  },
  {
    id: "select", label: "#2 state зависоко", color: C.purple,
    hint: "клікай на картки — зліва блимають всі UserCard, справа тільки змінений",
    badLabel: "❌ selected state в батьківському App",
    goodLabel: "✅ React.memo зупиняє незмінені компоненти",
    bad: <BadSelectScene />, good: <GoodSelectScene />,
  },
];

export default function PerformanceDemo() {
  const [tab, setTab] = useState("search");
  const sc = TABS.find(t => t.id === tab);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
      boxSizing: "border-box",
    }}>
      <style>{`
        @keyframes nodeflash {
          0%   { opacity: 0.7; }
          100% { opacity: 0;   }
        }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 660,
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
      }}>
        {/* header */}
        <div style={{
          background: C.surface2, borderBottom: `1px solid ${C.border}`,
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 11, color: C.muted }}>// сценарій:</span>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "4px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              fontFamily: "inherit",
              border: `1px solid ${tab === t.id ? t.color : C.border}`,
              background: tab === t.id ? t.color + "22" : "transparent",
              color: tab === t.id ? t.color : C.muted,
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 10, color: C.muted }}>⬤ = рендерів</span>
        </div>

        {/* bad */}
        <div style={{ borderBottom: `1px solid ${C.border}` }}>
          <div style={{ padding: "10px 16px 0 16px", fontSize: 11, color: C.red }}>{sc.badLabel}</div>
          <div style={{ padding: "16px", display: "flex", justifyContent: "center", background: "#0d1117", margin: "10px 16px 16px", borderRadius: 10, minHeight: 160 }}>
            {sc.bad}
          </div>
        </div>

        {/* good */}
        <div style={{ borderBottom: `1px solid ${C.border}` }}>
          <div style={{ padding: "10px 16px 0 16px", fontSize: 11, color: C.green }}>{sc.goodLabel}</div>
          <div style={{ padding: "16px", display: "flex", justifyContent: "center", background: "#0d1117", margin: "10px 16px 16px", borderRadius: 10, minHeight: 160 }}>
            {sc.good}
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: "9px 16px", fontSize: 11, color: C.muted }}>
          👆 {sc.hint}
        </div>
      </div>
    </div>
  );
}
