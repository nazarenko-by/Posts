// index.tsx — Рефакторинг живого коду #6 (Фінал)
// Звичайне preview-демо (не Remotion): усі 5 рефакторингів серії
// у спрощених живих міні-прикладах + "Коли який" decision picker.

import React, { useCallback, useRef, useState } from "react";
import { REFACTORS, suggestRefactor, RefactorInfo } from "./refactors";

// ── 1. Composition — Card розбитий на частини ───────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ border: "1px solid #2a2c4a", borderRadius: 8 }}>{children}</div>;
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "8px 12px", borderBottom: "1px solid #2a2c4a", fontWeight: 700 }}>{children}</div>;
}
function CardBody({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 12 }}>{children}</div>;
}

function CompositionDemo() {
  return (
    <Card>
      <CardHeader>Один God-компонент розбитий на частини</CardHeader>
      <CardBody>Header + Body тепер окремі компоненти, кожен з однією роботою.</CardBody>
    </Card>
  );
}

// ── 2. Custom Hook — useWindowWidth ──────────────────────────────────────────

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  React.useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

function CustomHookDemo() {
  const width = useWindowWidth();
  return <p>useWindowWidth() каже: вікно зараз {width}px завширшки.</p>;
}

// ── 3. Composition-слот — Layout/Header нейтральні ───────────────────────────

function Layout({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 8 }}>{children}</div>;
}
function Header({ children }: { children: React.ReactNode }) {
  return <header style={{ padding: 8, border: "1px solid #2a2c4a", flex: 1 }}>{children}</header>;
}
function UserMenu({ name }: { name: string }) {
  return <span style={{ color: "#7dcfff" }}>{name}</span>;
}

function CompositionSlotDemo() {
  return (
    <Layout>
      <Header>
        <UserMenu name="Богдан" />
      </Header>
    </Layout>
  );
}

// ── 4. Lookup-об'єкт — статус без вкладених тернарників ──────────────────────

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Очікує", color: "#e0af68" },
  paid: { label: "Оплачено", color: "#7dcfff" },
  shipped: { label: "Відправлено", color: "#9ece6a" },
  cancelled: { label: "Скасовано", color: "#ff5f57" },
};

function LookupDemo() {
  const [status, setStatus] = useState("pending");
  const { label, color } = STATUS_MAP[status];
  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {Object.keys(STATUS_MAP).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <p style={{ color }}>{label}</p>
    </div>
  );
}

// ── 5. useCallback / memo — стабільні посилання ──────────────────────────────

const Child = React.memo(function Child({ onClick }: { onClick: () => void }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div>
      Child render #{renders.current}{" "}
      <button onClick={onClick}>клік</button>
    </div>
  );
});

function MemoCallbackDemo() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    // no-op, лише для демонстрації стабільного посилання
  }, []);
  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Parent count: {count}</button>
      <Child onClick={handleClick} />
    </div>
  );
}

// ── 6. "Коли який" — interactive decision demo ───────────────────────────────

function DecisionPicker() {
  const [doesEverything, setDoesEverything] = useState(false);
  const [tooManyEffects, setTooManyEffects] = useState(false);
  const [unusedPropForwarding, setUnusedPropForwarding] = useState(false);
  const [nestedTernary, setNestedTernary] = useState(false);
  const [rerendersWithoutReason, setRerendersWithoutReason] = useState(false);

  const result: RefactorInfo = suggestRefactor({
    doesEverything,
    tooManyEffects,
    unusedPropForwarding,
    nestedTernary,
    rerendersWithoutReason,
  });

  return (
    <div>
      <label>
        <input type="checkbox" checked={doesEverything} onChange={(e) => setDoesEverything(e.target.checked)} />
        {" "}Один компонент робить усе
      </label>
      <br />
      <label>
        <input type="checkbox" checked={tooManyEffects} onChange={(e) => setTooManyEffects(e.target.checked)} />
        {" "}Купа useEffect в одному місці
      </label>
      <br />
      <label>
        <input type="checkbox" checked={unusedPropForwarding} onChange={(e) => setUnusedPropForwarding(e.target.checked)} />
        {" "}Пропс проходить крізь тих, хто його не використовує
      </label>
      <br />
      <label>
        <input type="checkbox" checked={nestedTernary} onChange={(e) => setNestedTernary(e.target.checked)} />
        {" "}Вкладений тернарник
      </label>
      <br />
      <label>
        <input type="checkbox" checked={rerendersWithoutReason} onChange={(e) => setRerendersWithoutReason(e.target.checked)} />
        {" "}Дочірній рендериться без причини
      </label>
      <p>
        Рекомендація: <b>{result.name}</b> - {result.fixes}
      </p>
    </div>
  );
}

// ── Main demo shell ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "composition", label: "Composition", render: () => <CompositionDemo /> },
  { id: "customHook", label: "Custom Hook", render: () => <CustomHookDemo /> },
  { id: "compositionSlot", label: "Composition-слот", render: () => <CompositionSlotDemo /> },
  { id: "lookup", label: "Lookup", render: () => <LookupDemo /> },
  { id: "memoCallback", label: "memo/useCallback", render: () => <MemoCallbackDemo /> },
  { id: "decision", label: "Коли який", render: () => <DecisionPicker /> },
] as const;

export default function Demo() {
  const [active, setActive] = useState<(typeof SECTIONS)[number]["id"]>("composition");
  const section = SECTIONS.find((s) => s.id === active)!;

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 480 }}>
      <h2>Рефакторинг живого коду — Фінал: усі 5 в одному демо</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{ fontWeight: active === s.id ? 700 : 400 }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
        {section.render()}
      </div>
      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        Список усіх рефакторингів: {REFACTORS.map((r) => r.name).join(", ")}
      </p>
    </div>
  );
}
