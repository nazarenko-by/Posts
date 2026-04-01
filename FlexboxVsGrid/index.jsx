import { useState, useEffect } from "react";

// ─── Design tokens (Tokyo Night) ────────────────────────────────────────────
const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

// ─── Flex demo items ─────────────────────────────────────────────────────────
const FLEX_ITEMS = [
  { label: "A", bg: "#7dcfff22", border: "#7dcfff55", color: "#7dcfff" },
  { label: "B", bg: "#bb9af722", border: "#bb9af755", color: "#bb9af7" },
  { label: "C", bg: "#9ece6a22", border: "#9ece6a55", color: "#9ece6a" },
  { label: "D", bg: "#ff9e6422", border: "#ff9e6455", color: "#ff9e64" },
];

const GRID_COLORS = [
  ["#7dcfff22","#7dcfff55","#7dcfff"],["#bb9af722","#bb9af755","#bb9af7"],
  ["#9ece6a22","#9ece6a55","#9ece6a"],["#ff9e6422","#ff9e6455","#ff9e64"],
  ["#e0af6822","#e0af6855","#e0af68"],["#ff5f5722","#ff5f5755","#ff5f57"],
  ["#7dcfff22","#7dcfff55","#7dcfff"],["#bb9af722","#bb9af755","#bb9af7"],
  ["#9ece6a22","#9ece6a55","#9ece6a"],
];

// ─── Reusable: Code block ────────────────────────────────────────────────────
function CodeBlock({ children, style }) {
  return (
    <div style={{
      background: C.surface2, borderRadius: 8, padding: "14px 18px",
      fontSize: 13, lineHeight: 1.9, color: C.text,
      borderLeft: `2px solid ${C.border}`,
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      ...style,
    }}>
      {children}
    </div>
  );
}

function KW({ children }) { return <span style={{ color: C.purple }}>{children}</span>; }
function Val({ children }) { return <span style={{ color: C.green }}>{children}</span>; }
function Cm({ children }) { return <span style={{ color: C.muted, fontStyle: "italic" }}>{children}</span>; }

// ─── Reusable: Select control ────────────────────────────────────────────────
function Ctrl({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderRadius: 6, padding: "5px 10px",
          color: C.text, fontSize: 12,
          fontFamily: "'JetBrains Mono','Fira Code',monospace",
          outline: "none", cursor: "pointer",
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Reusable: Card ──────────────────────────────────────────────────────────
function Card({ headerLeft, headerRight, children }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: "hidden", marginBottom: 16,
    }}>
      <div style={{
        background: C.surface2, padding: "12px 20px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{headerLeft}</span>
        {headerRight}
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

function AxisBadge({ color, children }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px",
      borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: color + "22", color,
    }}>
      {children}
    </span>
  );
}

// ─── Pros/Cons row ───────────────────────────────────────────────────────────
function ProsConsRow({ pros, cons }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
      <div style={{
        background: "#9ece6a11", border: "1px solid #9ece6a33",
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: C.green, marginBottom: 10 }}>
          ✓ Коли використовувати
        </div>
        {pros.map((p, i) => (
          <div key={i} style={{ fontSize: 12, lineHeight: 2.1, color: C.text }}>• {p}</div>
        ))}
      </div>
      <div style={{
        background: "#ff5f5711", border: "1px solid #ff5f5733",
        borderRadius: 12, padding: 20,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: C.red, marginBottom: 10 }}>
          ✗ Типові помилки
        </div>
        {cons.map((c, i) => (
          <div key={i} style={{ fontSize: 12, lineHeight: 2.1, color: C.text }}>• {c}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Use-cases chips ─────────────────────────────────────────────────────────
function UseCases({ color, items }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: 20, marginBottom: 16,
    }}>
      <div style={{ fontSize: 11, color: C.yellow, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>
        🎯 Ідеальний для:
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: "8px 16px", background: C.surface2,
            border: `1px solid ${color}33`, borderRadius: 8,
            fontSize: 12, fontWeight: 600, color,
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Comparison table ────────────────────────────────────────────────────────
function ComparisonTable() {
  const rows = [
    { prop: "Dimension",   flex: "1D — одна вісь",        grid: "2D — рядки + колонки" },
    { prop: "Use case",    flex: "Рядки / колонки елем.",  grid: "Макет сторінки" },
    { prop: "Alignment",   flex: "По головній осі",        grid: "По обох осях одночасно" },
    { prop: "Sizing",      flex: "flex-grow / shrink",     grid: "fr / minmax / fit-content" },
    { prop: "Overlap",     flex: "Складно",                grid: "grid-area легко" },
    { prop: "Gap",         flex: "gap ✓",                  grid: "gap ✓" },
  ];

  return (
    <Card
      headerLeft={<span style={{ color: C.yellow }}>⚔️ Швидке порівняння</span>}
      headerRight={<span style={{ fontSize: 11, color: C.muted }}>flex vs grid в таблиці</span>}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["Property", "Flexbox", "Grid"].map((h, i) => (
                <th key={h} style={{
                  padding: "8px 14px", textAlign: "left",
                  color: i === 0 ? C.muted : i === 1 ? C.purple : C.green,
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.prop} style={{ background: i % 2 === 0 ? "transparent" : C.surface2 + "55" }}>
                <td style={{ padding: "9px 14px", color: C.muted, fontSize: 11 }}>{row.prop}</td>
                <td style={{ padding: "9px 14px", color: C.text }}>{row.flex}</td>
                <td style={{ padding: "9px 14px", color: C.text }}>{row.grid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── FLEX TAB ────────────────────────────────────────────────────────────────
function FlexTab() {
  const [dir, setDir] = useState("row");
  const [jc, setJc] = useState("flex-start");
  const [ai, setAi] = useState("center");
  const [gap, setGap] = useState("12px");

  const demoStyle = {
    display: "flex",
    flexDirection: dir,
    justifyContent: jc,
    alignItems: ai,
    gap,
    minHeight: dir === "column" ? 180 : 100,
    background: C.surface2, borderRadius: 8, padding: 16,
    marginBottom: 16,
    transition: "all 0.25s ease",
  };

  return (
    <>
      <Card
        headerLeft={<span style={{ color: C.purple }}>Flexbox</span>}
        headerRight={<AxisBadge color={C.purple}>1D — одна вісь</AxisBadge>}
      >
        {/* Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <Ctrl label="flex-direction" value={dir} onChange={setDir}
            options={[{ value: "row", label: "row" }, { value: "column", label: "column" }]} />
          <Ctrl label="justify-content" value={jc} onChange={setJc}
            options={["flex-start","center","flex-end","space-between","space-around"].map(v=>({value:v,label:v}))} />
          <Ctrl label="align-items" value={ai} onChange={setAi}
            options={["center","flex-start","flex-end","stretch"].map(v=>({value:v,label:v}))} />
          <Ctrl label="gap" value={gap} onChange={setGap}
            options={["6px","12px","20px"].map(v=>({value:v,label:v}))} />
        </div>

        {/* Live demo */}
        <div style={demoStyle}>
          {FLEX_ITEMS.map(it => (
            <div key={it.label} style={{
              width: dir === "column" ? 80 : 52,
              height: dir === "column" ? 34 : 48,
              background: it.bg,
              border: `1px solid ${it.border}`,
              color: it.color,
              borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600,
              transition: "all 0.25s ease",
            }}>
              {it.label}
            </div>
          ))}
        </div>

        <CodeBlock>
          <KW>display</KW>: <Val>flex</Val>;<br />
          <KW>flex-direction</KW>: <Val>{dir}</Val>;<br />
          <KW>justify-content</KW>: <Val>{jc}</Val>;<br />
          <KW>align-items</KW>: <Val>{ai}</Val>;<br />
          <KW>gap</KW>: <Val>{gap}</Val>;
        </CodeBlock>
      </Card>

      <ProsConsRow
        pros={["Навбар з логотипом і меню", "Кнопка з іконкою + текстом", "Теги, що переносяться (wrap)", "Центрування одного елемента"]}
        cons={["Flex для сітки карток замість Grid", "Вкладений Flex там де треба Grid", "justify-content замість gap", "flex: 1 без розуміння"]}
      />
      <UseCases color={C.purple} items={["Навбар", "Кнопки", "Теги", "Центрування", "Форми"]} />
    </>
  );
}

// ─── GRID TAB ────────────────────────────────────────────────────────────────
function GridTab() {
  const [cols, setCols] = useState("repeat(3,1fr)");
  const [gap, setGap] = useState("16px");
  const [n, setN] = useState("6");

  const demoStyle = {
    display: "grid",
    gridTemplateColumns: cols,
    gap,
    background: C.surface2, borderRadius: 8, padding: 16,
    minHeight: 130, marginBottom: 16,
    transition: "all 0.25s ease",
  };

  return (
    <>
      <Card
        headerLeft={<span style={{ color: C.green }}>Grid</span>}
        headerRight={<AxisBadge color={C.green}>2D — рядки + колонки</AxisBadge>}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <Ctrl label="columns" value={cols} onChange={setCols}
            options={[
              { value: "repeat(2,1fr)", label: "repeat(2, 1fr)" },
              { value: "repeat(3,1fr)", label: "repeat(3, 1fr)" },
              { value: "repeat(4,1fr)", label: "repeat(4, 1fr)" },
              { value: "1fr 2fr", label: "1fr 2fr" },
              { value: "240px 1fr", label: "240px 1fr (sidebar)" },
              { value: "repeat(auto-fit,minmax(120px,1fr))", label: "auto-fit minmax" },
            ]} />
          <Ctrl label="gap" value={gap} onChange={setGap}
            options={["8px","16px","24px"].map(v=>({value:v,label:v}))} />
          <Ctrl label="items" value={n} onChange={setN}
            options={["4","6","9"].map(v=>({value:v,label:v}))} />
        </div>

        <div style={demoStyle}>
          {Array.from({ length: parseInt(n) }, (_, i) => {
            const c = GRID_COLORS[i % GRID_COLORS.length];
            return (
              <div key={i} style={{
                height: 52, background: c[0],
                border: `1px solid ${c[1]}`, color: c[2],
                borderRadius: 6, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600,
                transition: "all 0.25s ease",
              }}>
                {i + 1}
              </div>
            );
          })}
        </div>

        <CodeBlock>
          <KW>display</KW>: <Val>grid</Val>;<br />
          <KW>grid-template-columns</KW>: <Val>{cols}</Val>;<br />
          <KW>gap</KW>: <Val>{gap}</Val>;
        </CodeBlock>
      </Card>

      <ProsConsRow
        pros={["Макет сторінки (header/sidebar/main)", "Рівна сітка карток", "Дашборди і складні лейаути", "Коли треба align і по X і по Y"]}
        cons={["Grid для простого рядка кнопок", "grid-template-areas без потреби", "Надмірна складність замість Flex", "Забути про implicit grid"]}
      />
      <UseCases color={C.green} items={["Макет", "Картки", "Дашборд", "Галерея", "Sidebar"]} />
    </>
  );
}

// ─── COMBO TAB ───────────────────────────────────────────────────────────────
function ComboTab() {
  const RowLabel = ({ children }) => (
    <div style={{
      fontSize: 10, color: C.muted, padding: "5px 12px",
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
    }}>
      {children}
    </div>
  );

  const MockBlock = ({ style, children }) => (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 6, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 10, color: C.muted,
      ...style,
    }}>
      {children}
    </div>
  );

  const Tag = ({ color, children }) => (
    <div style={{
      padding: "4px 10px",
      background: color + "22", border: `1px solid ${color}44`,
      borderRadius: 99, fontSize: 10, color,
    }}>
      {children}
    </div>
  );

  return (
    <>
      <Card
        headerLeft={<span style={{ color: C.yellow }}>Flex + Grid разом</span>}
        headerRight={<span style={{ fontSize: 11, color: C.muted }}>типовий лейаут реального проєкту</span>}
      >
        <div style={{ background: C.surface2, borderRadius: 8, overflow: "hidden" }}>
          {/* Header — flex */}
          <RowLabel>display: flex — header/navbar</RowLabel>
          <div style={{
            padding: "12px 16px", display: "flex",
            alignItems: "center", justifyContent: "space-between",
            borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>⚡ Logo</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <MockBlock style={{ width: 52, height: 26 }}>Home</MockBlock>
              <MockBlock style={{ width: 52, height: 26 }}>About</MockBlock>
              <MockBlock style={{ width: 64, height: 26, background: "#7dcfff22", borderColor: "#7dcfff44", color: C.accent }}>Login</MockBlock>
            </div>
          </div>

          {/* Main — grid */}
          <RowLabel>display: grid — page layout (180px 1fr)</RowLabel>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", minHeight: 200 }}>
            {/* Sidebar */}
            <div style={{ borderRight: `1px solid ${C.border}`, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>sidebar</div>
              <MockBlock style={{ height: 20 }} />
              <MockBlock style={{ height: 20, background: "#bb9af722", borderColor: "#bb9af744", color: C.purple }}>Active</MockBlock>
              <MockBlock style={{ height: 20 }} />
              <MockBlock style={{ height: 20 }} />
            </div>
            {/* Content */}
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>display: grid — card grid (repeat(3,1fr))</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                {[[C.accent, C.purple, C.green]].flat().map((color, i) => (
                  <MockBlock key={i} style={{ height: 64, flexDirection: "column", gap: 4 }}>
                    <div style={{ width: 24, height: 24, background: color + "33", borderRadius: "50%" }} />
                    <span>Card</span>
                  </MockBlock>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>display: flex — tag row (flex-wrap: wrap)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <Tag color={C.accent}>React</Tag>
                <Tag color={C.purple}>TypeScript</Tag>
                <Tag color={C.green}>D3.js</Tag>
                <Tag color={C.yellow}>CSS</Tag>
              </div>
            </div>
          </div>

          {/* Footer — flex */}
          <RowLabel>display: flex — footer (justify-content: center)</RowLabel>
          <div style={{ padding: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            {[0,1,2].map(i => <MockBlock key={i} style={{ width: 60, height: 20 }} />)}
          </div>
        </div>

        <CodeBlock style={{ marginTop: 16 }}>
          <Cm>/* Grid — для структури */</Cm><br />
          <KW>grid-template-columns</KW>: <Val>240px 1fr</Val>;<br />
          <br />
          <Cm>/* Flex — для елементів всередині */</Cm><br />
          <KW>display</KW>: <Val>flex</Val>; <KW>align-items</KW>: <Val>center</Val>; <KW>gap</KW>: <Val>12px</Val>;
        </CodeBlock>
      </Card>

      <ComparisonTable />

      <div style={{
        background: C.surface2, border: `1px solid #e0af6844`,
        borderRadius: 12, padding: 20, fontSize: 13, lineHeight: 1.9,
      }}>
        <span style={{ color: C.yellow, fontWeight: 700, fontSize: 14 }}>💡 Золоте правило:</span><br />
        <span style={{ color: C.muted }}>Grid</span> — для{" "}
        <strong style={{ color: C.text }}>структури сторінки</strong>.{" "}
        <span style={{ color: C.muted }}>Flex</span> — для{" "}
        <strong style={{ color: C.text }}>елементів всередині</strong>.<br />
        Вони не конкурують — вони доповнюють одне одного. Обирай за завданням 🎯
      </div>
    </>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "flex",  label: "// Flexbox", color: C.purple },
  { id: "grid",  label: "// Grid",    color: C.green },
  { id: "combo", label: "// Комбо",   color: C.yellow },
];

export default function FlexboxVsGrid() {
  const [active, setActive] = useState("flex");

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      padding: "32px 24px", boxSizing: "border-box",
    }}>
      <style>{`
        select { appearance: auto; }
        select option { background: #1a1b2e; color: #c0caf5; }
        * { box-sizing: border-box; }
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: #2a2c4a; border-radius: 99px; }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: C.accent }}>
          ⚔️ Flexbox vs Grid
        </h1>
        <p style={{ margin: "6px 0 32px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          Не "що краще" — а "що для чого". Інтерактивний розбір з прикладами.
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {TABS.map(tab => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                style={{
                  background: isActive ? tab.color + "11" : "transparent",
                  border: `1px solid ${isActive ? tab.color : C.border}`,
                  borderRadius: 8, padding: "8px 20px",
                  fontSize: 13, color: isActive ? tab.color : C.muted,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {active === "flex"  && <FlexTab />}
        {active === "grid"  && <GridTab />}
        {active === "combo" && <ComboTab />}
      </div>
    </div>
  );
}
