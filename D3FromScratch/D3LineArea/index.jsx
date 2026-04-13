// D3 завантажується через CDN (useEffect нижче).
// У проєкті з bundler: import * as d3 from "d3"
import { useEffect, useRef, useState } from "react";

// ── palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:     "#0a0d14", surface: "#1a1b2e", s2: "#16213e",
  border: "#2a2c4a", accent:  "#7dcfff", purple: "#bb9af7",
  green:  "#9ece6a", orange:  "#ff9e64", yellow: "#e0af68",
  muted:  "#565f89", text:    "#c0caf5", red: "#ff5f57",
};
const MONO = "'JetBrains Mono','Fira Code',monospace";

// ── D3 loader hook ────────────────────────────────────────────────────────────
function useD3() {
  const [ready, setReady] = useState(!!window.d3);
  useEffect(() => {
    if (window.d3) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready ? window.d3 : null;
}

// ── chart constants ───────────────────────────────────────────────────────────
const VB_W = 360, VB_H = 200;
const ML = 40, MR = 16, MT = 16, MB = 28;
const IW = VB_W - ML - MR;
const IH = VB_H - MT - MB;

const SEED = [28, 65, 42, 88, 54, 72, 38, 61, 45, 83, 30, 69];
function genData(n) {
  return SEED.slice(0, n).map((v, i) => ({ i, v }));
}

// ── shared D3 draw helpers ────────────────────────────────────────────────────
function clearAndGetG(d3, svgEl) {
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();
  return svg.append("g").attr("transform", `translate(${ML},${MT})`);
}

function makeScales(d3, data) {
  const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, IW]);
  const y = d3.scaleLinear().domain([0, 100]).range([IH, 0]);
  return { x, y };
}

function drawAxes(d3, g, x, y, ticks = 5) {
  const styleGroup = ag => {
    ag.select(".domain").attr("stroke", C.border);
    ag.selectAll(".tick line").attr("stroke", C.border);
    ag.selectAll(".tick text")
      .attr("fill", C.muted)
      .attr("font-family", MONO)
      .attr("font-size", "9px");
  };
  g.append("g").attr("transform", `translate(0,${IH})`)
    .call(d3.axisBottom(x).ticks(ticks).tickSize(3))
    .call(styleGroup);
  g.append("g")
    .call(d3.axisLeft(y).ticks(4).tickSize(3))
    .call(styleGroup);
}

// ── shared UI ─────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background:   on ? t.color + "18" : "transparent",
            border:       `1px solid ${on ? t.color : C.border}`,
            borderRadius: 8, padding: "6px 16px",
            fontSize: 12, fontFamily: MONO,
            color: on ? t.color : C.muted,
            cursor: "pointer", transition: "all .15s",
          }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function Card({ title, titleColor = C.accent, badge, children }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: "hidden", marginBottom: 14,
    }}>
      <div style={{
        background: C.s2, padding: "10px 18px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: titleColor, fontFamily: MONO }}>
          {title}
        </span>
        {badge && <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>{badge}</span>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function CtrlRow({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      {children}
    </div>
  );
}

function Controls({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
      {children}
    </div>
  );
}

function CtrlLabel({ children, width = 80 }) {
  return (
    <span style={{ fontSize: 11, color: C.muted, minWidth: width, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function SliderCtrl({ label, min, max, step = 1, value, onChange, displayValue, color = C.accent }) {
  return (
    <CtrlRow>
      <CtrlLabel>{label}</CtrlLabel>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ flex: 1, accentColor: color, cursor: "pointer", minWidth: 80 }} />
      <span style={{ fontSize: 12, color: C.orange, minWidth: 44, textAlign: "right" }}>
        {displayValue ?? value}
      </span>
    </CtrlRow>
  );
}

function SegControl({ label, options, value, onChange, color = C.accent }) {
  return (
    <CtrlRow>
      {label && <CtrlLabel>{label}</CtrlLabel>}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {options.map(o => {
          const on = value === o.value;
          return (
            <button key={String(o.value)} onClick={() => onChange(o.value)} style={{
              background:   on ? color + "22" : "transparent",
              border:       `1px solid ${on ? color : C.border}`,
              borderRadius: 6, padding: "3px 12px",
              fontSize: 11, fontFamily: MONO,
              color: on ? color : C.muted,
              cursor: "pointer", transition: "all .15s",
            }}>
              {o.label}
            </button>
          );
        })}
      </div>
    </CtrlRow>
  );
}

function SelectCtrl({ label, options, value, onChange }) {
  return (
    <CtrlRow>
      <CtrlLabel>{label}</CtrlLabel>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        background: C.s2, border: `1px solid ${C.border}`,
        borderRadius: 6, padding: "4px 10px",
        fontSize: 11, fontFamily: MONO, color: C.text,
        outline: "none", cursor: "pointer",
      }}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </CtrlRow>
  );
}

function SvgWrap({ svgRef }) {
  return (
    <div style={{ background: C.s2, borderRadius: 8, overflow: "hidden" }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ display: "block" }} />
    </div>
  );
}

function CodeBox({ color = C.purple, children }) {
  return (
    <pre style={{
      background: C.s2, borderRadius: 8,
      padding: "12px 16px", fontSize: 12, lineHeight: 1.85,
      borderLeft: `2px solid ${color}`,
      fontFamily: MONO, whiteSpace: "pre-wrap",
      overflowX: "auto", margin: 0,
    }}>
      {children}
    </pre>
  );
}

const Kw  = ({ c }) => <span style={{ color: C.purple }}>{c}</span>;
const Fn  = ({ c }) => <span style={{ color: C.accent }}>{c}</span>;
const Str = ({ c }) => <span style={{ color: C.green  }}>{c}</span>;
const Num = ({ c }) => <span style={{ color: C.orange }}>{c}</span>;
const Cm  = ({ c }) => <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>;

// ── TAB 1: d3.line() ──────────────────────────────────────────────────────────
function LineTab({ d3 }) {
  const svgRef   = useRef(null);
  const [lw,     setLw]     = useState(2);
  const [pts,    setPts]    = useState(7);
  const [dots,   setDots]   = useState(true);

  useEffect(() => {
    if (!d3 || !svgRef.current) return;
    const data = genData(pts);
    const g = clearAndGetG(d3, svgRef.current);
    const { x, y } = makeScales(d3, data);
    drawAxes(d3, g, x, y, pts - 1);

    const lineGen = d3.line()
      .x(d => x(d.i)).y(d => y(d.v))
      .curve(d3.curveMonotoneX);

    g.append("path").datum(data)
      .attr("fill", "none")
      .attr("stroke", C.accent)
      .attr("stroke-width", lw)
      .attr("d", lineGen);

    if (dots) {
      g.selectAll("circle").data(data).join("circle")
        .attr("cx", d => x(d.i)).attr("cy", d => y(d.v))
        .attr("r", 3.5)
        .attr("fill", C.bg)
        .attr("stroke", C.accent)
        .attr("stroke-width", 1.5);
    }
  }, [d3, lw, pts, dots]);

  return (
    <div>
      <Card title="// d3.line()" titleColor={C.accent} badge="path generator">
        <SvgWrap svgRef={svgRef} />
        <Controls>
          <SliderCtrl label="товщина:"  min={1} max={5} step={0.5}
            value={lw} onChange={setLw}
            displayValue={lw + "px"} color={C.accent} />
          <SliderCtrl label="точки:"  min={3} max={12}
            value={pts} onChange={setPts} color={C.accent} />
          <SegControl label="dots:" value={dots} onChange={setDots} color={C.accent}
            options={[{ value: true, label: "показати" }, { value: false, label: "приховати" }]} />
        </Controls>
      </Card>

      <CodeBox color={C.accent}>
        <Cm c="// генератор шляху — повертає рядок 'd'" />{"\n"}
        <Kw c="const" /> line = d3.<Fn c="line" />(){"\n"}
        {"  "}.<Fn c="x" />(d ={">"} x(d.date)){"\n"}
        {"  "}.<Fn c="y" />(d ={">"} y(d.value)){"\n"}
        {"  "}.<Fn c="curve" />(d3.<Fn c="curveMonotoneX" />);{"\n\n"}
        <Cm c="// вішаємо на path" />{"\n"}
        svg.<Fn c="append" />(<Str c="'path'" />){"\n"}
        {"  "}.<Fn c="datum" />(data){"\n"}
        {"  "}.<Fn c="attr" />(<Str c="'d'" />, line){"  "}<Cm c="// line(data) → 'M0,50 L10,20...'" />{"\n"}
        {"  "}.<Fn c="attr" />(<Str c="'fill'" />, <Str c="'none'" />){"\n"}
        {"  "}.<Fn c="attr" />(<Str c="'stroke'" />, <Str c="'#7dcfff'" />){"\n"}
        {"  "}.<Fn c="attr" />(<Str c="'stroke-width'" />, <Num c={String(lw)} />);
      </CodeBox>
    </div>
  );
}

// ── TAB 2: d3.area() ──────────────────────────────────────────────────────────
const BASELINE_OPTIONS = [
  { value: "bottom", label: "y0 = height (знизу)" },
  { value: "mid",    label: "y0 = середина"        },
  { value: "zero",   label: "y0 = 0 (зверху)"      },
];

function AreaTab({ d3 }) {
  const svgRef    = useRef(null);
  const [opacity, setOpacity]  = useState(0.15);
  const [baseline, setBaseline] = useState("bottom");

  useEffect(() => {
    if (!d3 || !svgRef.current) return;
    const data = genData(7);
    const g = clearAndGetG(d3, svgRef.current);
    const { x, y } = makeScales(d3, data);
    drawAxes(d3, g, x, y);

    const y0map = { bottom: IH, mid: IH / 2, zero: 0 };
    const y0val = y0map[baseline];

    const areaGen = d3.area()
      .x(d => x(d.i)).y0(y0val).y1(d => y(d.v))
      .curve(d3.curveMonotoneX);
    const lineGen = d3.line()
      .x(d => x(d.i)).y(d => y(d.v))
      .curve(d3.curveMonotoneX);

    g.append("path").datum(data)
      .attr("fill", C.accent).attr("opacity", opacity)
      .attr("d", areaGen);
    g.append("path").datum(data)
      .attr("fill", "none").attr("stroke", C.accent).attr("stroke-width", 2)
      .attr("d", lineGen);

    // baseline indicator
    const y0labels = {
      bottom: `y0 = ${IH}px (height)`,
      mid:    `y0 = ${IH / 2}px (середина)`,
      zero:   "y0 = 0px (верх)",
    };
    g.append("line")
      .attr("x1", 0).attr("x2", IW)
      .attr("y1", y0val).attr("y2", y0val)
      .attr("stroke", C.orange).attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,3");
    g.append("text")
      .attr("x", IW - 2).attr("y", y0val - 5)
      .attr("text-anchor", "end")
      .attr("fill", C.orange).attr("font-size", "9px")
      .attr("font-family", MONO)
      .text(y0labels[baseline]);
  }, [d3, opacity, baseline]);

  const y0CodeVal = { bottom: "height", mid: "height / 2", zero: "0" }[baseline];

  return (
    <div>
      <Card title="// d3.area()" titleColor={C.green} badge="area generator">
        <SvgWrap svgRef={svgRef} />
        <Controls>
          <SliderCtrl label="opacity:" min={0.05} max={0.5} step={0.05}
            value={opacity} onChange={setOpacity}
            displayValue={opacity.toFixed(2)} color={C.green} />
          <SelectCtrl label="baseline:" value={baseline} onChange={setBaseline}
            options={BASELINE_OPTIONS} />
        </Controls>
      </Card>

      <CodeBox color={C.green}>
        <Cm c="// area — лінія + заповнення між y0 і y1" />{"\n"}
        <Kw c="const" /> area = d3.<Fn c="area" />(){"\n"}
        {"  "}.<Fn c="x" />(d ={">"} x(d.date)){"\n"}
        {"  "}.<Fn c="y0" />(<Num c={y0CodeVal} />){"  "}<Cm c="// нижня межа (помаранчева лінія)" />{"\n"}
        {"  "}.<Fn c="y1" />(d ={">"} y(d.value)){"  "}<Cm c="// верхня межа = дані" />{"\n"}
        {"  "}.<Fn c="curve" />(d3.<Fn c="curveMonotoneX" />);{"\n\n"}
        svg.<Fn c="append" />(<Str c="'path'" />).<Fn c="datum" />(data){"\n"}
        {"  "}.<Fn c="attr" />(<Str c="'d'" />, area){"\n"}
        {"  "}.<Fn c="attr" />(<Str c="'fill'" />, <Str c="'#7dcfff'" />){"\n"}
        {"  "}.<Fn c="attr" />(<Str c="'opacity'" />, <Num c={opacity.toFixed(2)} />);
      </CodeBox>
    </div>
  );
}

// ── TAB 3: curve ──────────────────────────────────────────────────────────────
const CURVE_OPTIONS = [
  { value: "linear",   label: "curveLinear (без згладжування)" },
  { value: "monotone", label: "curveMonotoneX (рекомендовано)" },
  { value: "catmull",  label: "curveCatmullRom (округло)"      },
  { value: "step",     label: "curveStep (ступінчаста)"         },
  { value: "basis",    label: "curveBasis (дуже плавно)"        },
];

function CurveTab({ d3 }) {
  const svgRef      = useRef(null);
  const [curveKey, setCurveKey] = useState("monotone");

  useEffect(() => {
    if (!d3 || !svgRef.current) return;
    const curveMap = {
      linear:   d3.curveLinear,
      monotone: d3.curveMonotoneX,
      catmull:  d3.curveCatmullRom,
      step:     d3.curveStep,
      basis:    d3.curveBasis,
    };
    const data = genData(8);
    const g = clearAndGetG(d3, svgRef.current);
    const { x, y } = makeScales(d3, data);
    drawAxes(d3, g, x, y, 7);

    const curve   = curveMap[curveKey];
    const lineGen = d3.line().x(d => x(d.i)).y(d => y(d.v)).curve(curve);
    const areaGen = d3.area().x(d => x(d.i)).y0(IH).y1(d => y(d.v)).curve(curve);

    g.append("path").datum(data)
      .attr("fill", C.purple).attr("opacity", 0.1)
      .attr("d", areaGen);
    g.append("path").datum(data)
      .attr("fill", "none").attr("stroke", C.purple).attr("stroke-width", 2)
      .attr("d", lineGen);

    g.selectAll("circle").data(data).join("circle")
      .attr("cx", d => x(d.i)).attr("cy", d => y(d.v))
      .attr("r", 3)
      .attr("fill", C.bg)
      .attr("stroke", C.purple)
      .attr("stroke-width", 1.5);
  }, [d3, curveKey]);

  const curveD3Name = {
    linear:   "curveLinear",
    monotone: "curveMonotoneX",
    catmull:  "curveCatmullRom",
    step:     "curveStep",
    basis:    "curveBasis",
  }[curveKey];

  return (
    <div>
      <Card title="// .curve()" titleColor={C.purple} badge="curve interpolation">
        <SvgWrap svgRef={svgRef} />
        <Controls>
          <SelectCtrl label="curve:" value={curveKey} onChange={setCurveKey}
            options={CURVE_OPTIONS} />
        </Controls>
      </Card>

      <CodeBox color={C.purple}>
        <Cm c="// .curve() — тип інтерполяції між точками" />{"\n"}
        <Kw c="const" /> line = d3.<Fn c="line" />(){"\n"}
        {"  "}.<Fn c="x" />(d ={">"} x(d.date)){"\n"}
        {"  "}.<Fn c="y" />(d ={">"} y(d.value)){"\n"}
        {"  "}.<Fn c="curve" />(d3.<Fn c={curveD3Name} />);{"\n\n"}
        <Cm c="// теж саме для area()" />{"\n"}
        <Kw c="const" /> area = d3.<Fn c="area" />().<Fn c="curve" />(d3.<Fn c={curveD3Name} />);
      </CodeBox>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "line",  label: "d3.line()",  color: C.accent  },
  { id: "area",  label: "d3.area()",  color: C.green   },
  { id: "curve", label: ".curve()",   color: C.purple  },
];

export default function D3LineAreaDemo() {
  const [active, setActive] = useState("line");
  const d3 = useD3();

  return (
    <div style={{
      background: C.bg, color: C.text, minHeight: "100vh",
      fontFamily: MONO, padding: "28px 22px", boxSizing: "border-box",
    }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input[type=range]{cursor:pointer} select option{background:#16213e} *::-webkit-scrollbar{width:5px} *::-webkit-scrollbar-thumb{background:#2a2c4a;border-radius:99px}`}</style>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.accent, marginBottom: 6 }}>
          📉 D3 Line &amp; Area
        </h1>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>
          // d3.line() · d3.area() · curve interpolation
        </p>

        <TabBar tabs={TABS} active={active} onChange={setActive} />

        {!d3 && (
          <div style={{ color: C.muted, fontSize: 12, padding: "24px 0" }}>
            ⏳ завантажую D3...
          </div>
        )}

        {d3 && active === "line"  && <LineTab  d3={d3} />}
        {d3 && active === "area"  && <AreaTab  d3={d3} />}
        {d3 && active === "curve" && <CurveTab d3={d3} />}

        <div style={{
          background: C.s2, border: `1px solid ${C.yellow}44`,
          borderRadius: 12, padding: "14px 18px",
          fontSize: 13, lineHeight: 1.9, marginTop: 8,
        }}>
          <span style={{ color: C.yellow, fontWeight: 700 }}>💡 Ключова ідея:</span><br />
          <code style={{ color: C.accent }}>d3.line()</code>
          <span style={{ color: C.muted }}> і </span>
          <code style={{ color: C.green }}>d3.area()</code>
          <span style={{ color: C.muted }}> — це </span>
          <span style={{ color: C.text }}>генератори рядків</span>
          <span style={{ color: C.muted }}>. Вони приймають масив даних і повертають рядок для атрибуту </span>
          <code style={{ color: C.orange }}>d</code>
          <span style={{ color: C.muted }}> SVG path. Курва — просто алгоритм інтерполяції між точками. 🎯</span>
        </div>

      </div>
    </div>
  );
}
