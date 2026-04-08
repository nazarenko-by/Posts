import { useState, useCallback } from "react";

// ── palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:     "#0a0d14", surface: "#1a1b2e", s2: "#16213e",
  border: "#2a2c4a", accent:  "#7dcfff", purple: "#bb9af7",
  green:  "#9ece6a", orange:  "#ff9e64", yellow: "#e0af68",
  muted:  "#565f89", text:    "#c0caf5",
};

const MONO = "'JetBrains Mono','Fira Code',monospace";
const W    = 400;
const PAD  = 10;   // left/right padding inside SVG

// ── shared mini-components ────────────────────────────────────────────────────
function Mapping({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 12, flexWrap: "wrap" }}>
      {children}
    </div>
  );
}
function Chip({ color = C.text, bg = C.s2, children }) {
  return (
    <span style={{
      color, background: bg,
      border: `1px solid ${C.border}`,
      borderRadius: 5, padding: "3px 10px",
      fontFamily: MONO, fontSize: 12,
    }}>
      {children}
    </span>
  );
}
function Arrow() {
  return <span style={{ color: C.accent }}>→</span>;
}
function CtrlLabel({ children }) {
  return <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{children}</span>;
}

// shared SVG axis text / tick helpers
function TickLabel({ x, y, anchor = "middle", children }) {
  return (
    <text x={x} y={y} textAnchor={anchor}
      fontSize={10} fontFamily={MONO} fill={C.muted}>
      {children}
    </text>
  );
}
function Tick({ x, y1, y2 }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.border} strokeWidth={1} />;
}
function AxisLine({ x1, y, x2 }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.border} strokeWidth={1} />;
}

// ── Tab 1: scaleLinear ────────────────────────────────────────────────────────
function LinearTab() {
  const [val, setVal] = useState(60);

  // domain [0,100] → range [0, W]
  const sc  = useCallback(v => (v / 100) * W, []);
  const px  = Math.round(sc(val));

  const domTicks = [0, 25, 50, 75, 100];
  const pxTicks  = [0, 100, 200, 300, 400];

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 16px" }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
        domain <span style={{ color: C.accent }}>[0, 100]</span>
        {" → "}range <span style={{ color: C.accent }}>[0, 400px]</span>
      </div>

      <svg width="100%" height={150} viewBox={`0 0 ${W + PAD * 2} 150`}>
        {/* — data axis — */}
        <AxisLine x1={PAD} y={55} x2={PAD + W} />
        {domTicks.map(t => (
          <g key={t}>
            <Tick x={PAD + sc(t)} y1={50} y2={60} />
            <TickLabel x={PAD + sc(t)} y={74}>{t}</TickLabel>
          </g>
        ))}
        <TickLabel x={PAD + 4} y={46} anchor="start">data</TickLabel>

        {/* — dashed connector — */}
        <line
          x1={PAD + sc(val)} y1={60}
          x2={PAD + px}      y2={100}
          stroke={C.muted} strokeWidth={1} strokeDasharray="3,3"
        />

        {/* — input dot (domain) — */}
        <circle cx={PAD + sc(val)} cy={55} r={5} fill={C.purple} />

        {/* — px axis — */}
        <AxisLine x1={PAD} y={105} x2={PAD + W} />

        {/* fill bar */}
        <rect x={PAD} y={100} width={px} height={8}
          fill={C.accent + "44"} rx={2} />

        {pxTicks.map(t => (
          <g key={t}>
            <Tick x={PAD + t} y1={100} y2={110} />
            <TickLabel x={PAD + t} y={124}>{t}px</TickLabel>
          </g>
        ))}
        <TickLabel x={PAD + 4} y={140} anchor="start">px</TickLabel>

        {/* — output dot (range) — */}
        <circle cx={PAD + px} cy={105} r={5} fill={C.green} />
      </svg>

      {/* slider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <CtrlLabel>значення:</CtrlLabel>
        <input type="range" min={0} max={100} step={1} value={val}
          onChange={e => setVal(+e.target.value)}
          style={{ flex: 1, accentColor: C.accent }} />
        <span style={{ fontSize: 12, color: C.orange, minWidth: 36, textAlign: "right" }}>{val}</span>
      </div>

      <Mapping>
        <CtrlLabel>scale(</CtrlLabel>
        <Chip color={C.text}>{val}</Chip>
        <CtrlLabel>)</CtrlLabel>
        <Arrow />
        <Chip color={C.green}>{px}px</Chip>
      </Mapping>
    </div>
  );
}

// ── Tab 2: scaleBand ──────────────────────────────────────────────────────────
const BAND_DOMAIN = ["Пн", "Вт", "Ср", "Чт", "Пт"];
const BAND_COLORS = [C.accent, C.purple, C.green, C.orange, C.yellow];
const BAND_VALS   = [42, 78, 55, 91, 34];

function BandTab() {
  const [padding, setPadding] = useState(0.2);

  // replicate d3.scaleBand logic
  const n    = BAND_DOMAIN.length;
  const step = W / n;
  const bw   = Math.round(step * (1 - padding));

  const items = BAND_DOMAIN.map((label, i) => ({
    label,
    x: Math.round(i * step + step * padding / 2),
  }));

  // bandwidth marker y
  const markerY = 148;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 16px" }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
        domain <span style={{ color: C.accent }}>['Пн','Вт','Ср','Чт','Пт']</span>
        {" → "}range <span style={{ color: C.accent }}>[0, 400px]</span>
        {" · padding "}
        <span style={{ color: C.accent }}>{padding.toFixed(2)}</span>
      </div>

      <svg width="100%" height={170} viewBox={`0 0 ${W + PAD * 2} 170`}>
        {/* baseline */}
        <AxisLine x1={PAD} y={120} x2={PAD + W} />

        {items.map((it, i) => {
          const x   = PAD + it.x;
          const col = BAND_COLORS[i];
          const barH = Math.round(BAND_VALS[i] * 0.9);
          return (
            <g key={it.label}>
              <rect x={x} y={120 - barH} width={bw} height={barH}
                fill={col + "44"} stroke={col} strokeWidth={1} rx={2} />
              {/* category label below baseline */}
              <text x={x + bw / 2} y={136} textAnchor="middle"
                fontSize={11} fontFamily={MONO} fill={C.text}>
                {it.label}
              </text>
              {/* x-offset label above bar */}
              <TickLabel x={x + bw / 2} y={120 - barH - 5}>{it.x}px</TickLabel>
            </g>
          );
        })}

        {/* bandwidth callout for first bar */}
        {(() => {
          const x0 = PAD + items[0].x;
          return (
            <g>
              <line x1={x0} y1={markerY} x2={x0 + bw} y2={markerY}
                stroke={C.accent} strokeWidth={1.5} />
              <line x1={x0}      y1={markerY - 4} x2={x0}      y2={markerY + 4} stroke={C.accent} strokeWidth={1.5} />
              <line x1={x0 + bw} y1={markerY - 4} x2={x0 + bw} y2={markerY + 4} stroke={C.accent} strokeWidth={1.5} />
              <TickLabel x={x0 + bw / 2} y={165}>bw={bw}px</TickLabel>
            </g>
          );
        })()}
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <CtrlLabel>padding:</CtrlLabel>
        <input type="range" min={0} max={0.6} step={0.05} value={padding}
          onChange={e => setPadding(+e.target.value)}
          style={{ flex: 1, accentColor: C.accent }} />
        <span style={{ fontSize: 12, color: C.orange, minWidth: 36, textAlign: "right" }}>
          {padding.toFixed(2)}
        </span>
      </div>

      <Mapping>
        <CtrlLabel>bandwidth()&nbsp;=</CtrlLabel>
        <Chip color={C.green}>{bw}px</Chip>
      </Mapping>
    </div>
  );
}

// ── Tab 3: scaleTime ──────────────────────────────────────────────────────────
const MONTHS_UA = ["Січ","Лют","Бер","Кві","Тра","Чер","Лип","Сер","Вер","Жов","Лис","Гру"];
const MAJOR_MONTHS = [0, 3, 6, 9, 11];

function TimeTab() {
  const [monthIdx, setMonthIdx] = useState(6);

  // domain [0, 11] → range [0, W]  (months as indices)
  const sc = useCallback(m => Math.round((m / 11) * W), []);
  const px = sc(monthIdx);

  const pxTicks = [0, 100, 200, 300, 400];

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 16px" }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
        domain <span style={{ color: C.accent }}>[Jan 2024, Dec 2024]</span>
        {" → "}range <span style={{ color: C.accent }}>[0, 400px]</span>
      </div>

      <svg width="100%" height={155} viewBox={`0 0 ${W + PAD * 2} 155`}>
        {/* date axis */}
        <AxisLine x1={PAD} y={65} x2={PAD + W} />
        {MAJOR_MONTHS.map(m => (
          <g key={m}>
            <Tick x={PAD + sc(m)} y1={60} y2={70} />
            <TickLabel x={PAD + sc(m)} y={84}>{MONTHS_UA[m]}</TickLabel>
          </g>
        ))}
        <TickLabel x={PAD + 4} y={55} anchor="start">date</TickLabel>

        {/* input dot */}
        <circle cx={PAD + sc(monthIdx)} cy={65} r={5} fill={C.purple} />

        {/* dashed connector */}
        <line
          x1={PAD + sc(monthIdx)} y1={70}
          x2={PAD + px}           y2={110}
          stroke={C.muted} strokeWidth={1} strokeDasharray="3,3"
        />

        {/* px axis */}
        <AxisLine x1={PAD} y={115} x2={PAD + W} />

        {/* fill bar */}
        <rect x={PAD} y={110} width={px} height={8}
          fill={C.yellow + "44"} rx={2} />

        {pxTicks.map(t => (
          <g key={t}>
            <Tick x={PAD + t} y1={110} y2={120} />
            <TickLabel x={PAD + t} y={135}>{t}px</TickLabel>
          </g>
        ))}
        <TickLabel x={PAD + 4} y={150} anchor="start">px</TickLabel>

        {/* output dot */}
        <circle cx={PAD + px} cy={115} r={5} fill={C.green} />
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <CtrlLabel>місяць:</CtrlLabel>
        <input type="range" min={0} max={11} step={1} value={monthIdx}
          onChange={e => setMonthIdx(+e.target.value)}
          style={{ flex: 1, accentColor: C.accent }} />
        <span style={{ fontSize: 12, color: C.orange, minWidth: 36, textAlign: "right" }}>
          {MONTHS_UA[monthIdx]}
        </span>
      </div>

      <Mapping>
        <CtrlLabel>scale(new Date('2024-{MONTHS_UA[monthIdx]}-01'))</CtrlLabel>
        <Arrow />
        <Chip color={C.green}>{px}px</Chip>
      </Mapping>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "linear", label: "scaleLinear", component: LinearTab },
  { id: "band",   label: "scaleBand",   component: BandTab   },
  { id: "time",   label: "scaleTime",   component: TimeTab   },
];

export default function D3ScalesDemo() {
  const [active, setActive] = useState("linear");
  const ActivePanel = TABS.find(t => t.id === active).component;

  return (
    <div style={{
      background: C.bg, fontFamily: MONO,
      minHeight: "100vh", width: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxSizing: "border-box", padding: "24px 20px",
    }}>
    <div style={{ width: "100%", maxWidth: 520 }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { cursor: pointer; }
      `}</style>

      {/* tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => {
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              background:   on ? C.purple + "18" : "transparent",
              border:       `1px solid ${on ? C.purple : C.border}`,
              borderRadius: 6, padding: "5px 14px",
              fontSize:     12, fontFamily: MONO,
              color:        on ? C.purple : C.muted,
              cursor:       "pointer", transition: "all .15s",
            }}>
              {t.label}
            </button>
          );
        })}
      </div>

      <ActivePanel />
    </div>
    </div>
  );
}
