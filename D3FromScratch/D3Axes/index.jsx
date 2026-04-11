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

// ── shared UI ─────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
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
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{
        background: C.s2, padding: "10px 18px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: titleColor, fontFamily: MONO }}>{title}</span>
        {badge && <span style={{ fontSize: 11, color: C.muted, fontFamily: MONO }}>{badge}</span>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function CtrlRow({ children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center" }}>
      {children}
    </div>
  );
}

function SegControl({ label, options, value, onChange, color = C.accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {label && <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{label}</span>}
      <div style={{ display: "flex", gap: 4 }}>
        {options.map(o => {
          const on = value === o.value;
          return (
            <button key={o.value} onClick={() => onChange(o.value)} style={{
              background:   on ? color + "22" : "transparent",
              border:       `1px solid ${on ? color : C.border}`,
              borderRadius: 6, padding: "4px 12px",
              fontSize: 11, fontFamily: MONO,
              color: on ? color : C.muted,
              cursor: "pointer", transition: "all .15s",
            }}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderCtrl({ label, min, max, step = 1, value, onChange, color = C.accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 180 }}>
      <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ flex: 1, accentColor: color, cursor: "pointer" }} />
      <span style={{ fontSize: 12, color: C.orange, minWidth: 28, textAlign: "right" }}>{value}</span>
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

// shared chart data
const CHART_DATA = Array.from({ length: 12 }, (_, i) => ({
  date:  new Date(2024, i, 1),
  value: 1200 + Math.round(Math.sin(i * 0.8) * 600 + i * 120 + Math.random() * 200),
}));

// ── shared draw utils ─────────────────────────────────────────────────────────
function applyAxisStyle(sel) {
  sel.selectAll("path,line").attr("stroke", C.border);
  sel.selectAll("text").attr("fill", C.muted).attr("font-family", MONO).attr("font-size", 10);
  return sel;
}

// ── TAB 1: axisBottom + axisLeft ─────────────────────────────────────────────
function AxisTab({ d3 }) {
  const svgRef   = useRef(null);
  const [ticks,  setTicks]  = useState(6);
  const [xSide,  setXSide]  = useState("bottom");   // "bottom" | "top"
  const [ySide,  setYSide]  = useState("left");     // "left"   | "right"

  useEffect(() => {
    if (!d3 || !svgRef.current) return;
    const M = { top: 32, right: 48, bottom: 32, left: 60 };
    const totalW = svgRef.current.parentElement.clientWidth || 560;
    const totalH = 240;
    const W = totalW - M.left - M.right;
    const H = totalH - M.top  - M.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", totalW).attr("height", totalH);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(CHART_DATA, d => d.date))
      .range([0, W]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(CHART_DATA, d => d.value)]).nice()
      .range([H, 0]);

    // area
    g.append("path")
      .datum(CHART_DATA)
      .attr("fill", C.accent + "18")
      .attr("d", d3.area().x(d => x(d.date)).y0(H).y1(d => y(d.value)).curve(d3.curveMonotoneX));

    g.append("path")
      .datum(CHART_DATA)
      .attr("fill", "none").attr("stroke", C.accent).attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.date)).y(d => y(d.value)).curve(d3.curveMonotoneX));

    // x axis
    const xAxis = xSide === "bottom"
      ? d3.axisBottom(x).ticks(ticks).tickFormat(d3.timeFormat("%b"))
      : d3.axisTop(x).ticks(ticks).tickFormat(d3.timeFormat("%b"));
    g.append("g")
      .attr("transform", xSide === "bottom" ? `translate(0,${H})` : "translate(0,0)")
      .call(xAxis).call(applyAxisStyle);

    // y axis
    const yAxis = ySide === "left"
      ? d3.axisLeft(y).ticks(5)
      : d3.axisRight(y).ticks(5);
    g.append("g")
      .attr("transform", ySide === "left" ? "translate(0,0)" : `translate(${W},0)`)
      .call(yAxis).call(applyAxisStyle);

    // highlight axis labels
    g.selectAll(".tick text").attr("fill", C.muted);

  }, [d3, ticks, xSide, ySide]);

  return (
    <div>
      <Card title="// axisBottom + axisLeft" titleColor={C.accent} badge="d3-axis">
        <CtrlRow>
          <SliderCtrl label="ticks X:" min={2} max={12} value={ticks} onChange={setTicks} color={C.accent} />
          <SegControl label="X сторона:" value={xSide} onChange={setXSide} color={C.accent}
            options={[{ value: "bottom", label: "bottom" }, { value: "top", label: "top" }]} />
          <SegControl label="Y сторона:" value={ySide} onChange={setYSide} color={C.purple}
            options={[{ value: "left", label: "left" }, { value: "right", label: "right" }]} />
        </CtrlRow>
        <div style={{ background: C.s2, borderRadius: 8, overflow: "hidden" }}>
          <svg ref={svgRef} style={{ display: "block", width: "100%" }} />
        </div>
      </Card>

      <CodeBox color={C.accent}>
        <Cm c="// вісь X — можна зверху або знизу" />{"\n"}
        <Kw c="const" /> xAxis = d3.<Fn c={xSide === "bottom" ? "axisBottom" : "axisTop"} />(x)<Fn c=".ticks" />(<Num c={String(ticks)} />);{"\n\n"}
        <Cm c="// вісь Y — зліва або справа" />{"\n"}
        <Kw c="const" /> yAxis = d3.<Fn c={ySide === "left" ? "axisLeft" : "axisRight"} />(y);{"\n\n"}
        svg.<Fn c="append" />(<Str c="'g'" />){"\n"}
        {"  "}.<Fn c="attr" />(<Str c="'transform'" />, <Str c={`'translate(0,${xSide === "bottom" ? "height" : "0"})'`} />){"\n"}
        {"  "}.<Fn c="call" />(xAxis);
      </CodeBox>
    </div>
  );
}

// ── TAB 2: tickFormat ─────────────────────────────────────────────────────────
const Y_FORMATS = [
  { value: "raw",    label: "1000"    },
  { value: "money",  label: "$1,000"  },
  { value: "kilo",   label: "1k"      },
  { value: "pct",    label: "10%"     },
];
const X_FORMATS = [
  { value: "mon",    label: "%b"       },
  { value: "monyr",  label: "%b %Y"   },
  { value: "day",    label: "%d"      },
];

function FormatTab({ d3 }) {
  const svgRef   = useRef(null);
  const [yFmt,   setYFmt]  = useState("raw");
  const [xFmt,   setXFmt]  = useState("mon");

  useEffect(() => {
    if (!d3 || !svgRef.current) return;
    const M = { top: 20, right: 24, bottom: 36, left: 72 };
    const totalW = svgRef.current.parentElement.clientWidth || 560;
    const totalH = 240;
    const W = totalW - M.left - M.right;
    const H = totalH - M.top  - M.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", totalW).attr("height", totalH);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(CHART_DATA, d => d.date)).range([0, W]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(CHART_DATA, d => d.value)]).nice().range([H, 0]);

    // area + line
    g.append("path").datum(CHART_DATA)
      .attr("fill", C.purple + "18")
      .attr("d", d3.area().x(d => x(d.date)).y0(H).y1(d => y(d.value)).curve(d3.curveMonotoneX));
    g.append("path").datum(CHART_DATA)
      .attr("fill", "none").attr("stroke", C.purple).attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.date)).y(d => y(d.value)).curve(d3.curveMonotoneX));

    // y format
    const yFormatter = {
      raw:   d => d3.format(",.0f")(d),
      money: d => d3.format("$,.0f")(d),
      kilo:  d => d >= 1000 ? (d / 1000).toFixed(1) + "k" : d,
      pct:   d => d3.format(".0%")(d / d3.max(CHART_DATA, v => v.value)),
    }[yFmt];

    // x format
    const xFmtStr = { mon: "%b", monyr: "%b %Y", day: "%d" }[xFmt];

    g.append("g").attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat(xFmtStr)))
      .call(applyAxisStyle);

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(yFormatter))
      .call(applyAxisStyle);

    // dots
    g.selectAll("circle").data(CHART_DATA).join("circle")
      .attr("cx", d => x(d.date)).attr("cy", d => y(d.value))
      .attr("r", 3).attr("fill", C.purple);

  }, [d3, yFmt, xFmt]);

  const yCodeStr = {
    raw:   `d3.format(",.0f")`,
    money: `d3.format("$,.0f")`,
    kilo:  `d => d >= 1000 ? d/1000 + "k" : d`,
    pct:   `d3.format(".0%")`,
  }[yFmt];

  const xCodeStr = { mon: `"%b"`, monyr: `"%b %Y"`, day: `"%d"` }[xFmt];

  return (
    <div>
      <Card title="// tickFormat" titleColor={C.purple} badge="d3-format">
        <CtrlRow>
          <SegControl label="Y формат:" value={yFmt} onChange={setYFmt} color={C.purple} options={Y_FORMATS} />
          <SegControl label="X формат:" value={xFmt} onChange={setXFmt} color={C.green}  options={X_FORMATS} />
        </CtrlRow>
        <div style={{ background: C.s2, borderRadius: 8, overflow: "hidden" }}>
          <svg ref={svgRef} style={{ display: "block", width: "100%" }} />
        </div>
      </Card>

      <CodeBox color={C.purple}>
        <Cm c="// Y: числовий формат через d3.format" />{"\n"}
        <Kw c="const" /> yFmt = {yCodeStr};{"\n\n"}
        <Cm c={`// X: дата через d3.timeFormat(${xCodeStr})`} />{"\n"}
        <Kw c="const" /> xFmt = d3.<Fn c="timeFormat" />(<Str c={xCodeStr} />);{"\n\n"}
        <Fn c="axisLeft" />(y).<Fn c="tickFormat" />(yFmt);{"\n"}
        <Fn c="axisBottom" />(x).<Fn c="tickFormat" />(xFmt);
      </CodeBox>
    </div>
  );
}

// ── TAB 3: tickSize → gridlines ───────────────────────────────────────────────
function GridTab({ d3 }) {
  const svgRef   = useRef(null);
  const [grid,   setGrid]   = useState(true);
  const [ticks,  setTicks]  = useState(5);
  const [size,   setSize]   = useState(6);   // outer tick size
  const [dashed, setDashed] = useState(true);

  useEffect(() => {
    if (!d3 || !svgRef.current) return;
    const M = { top: 20, right: 24, bottom: 36, left: 56 };
    const totalW = svgRef.current.parentElement.clientWidth || 560;
    const totalH = 240;
    const W = totalW - M.left - M.right;
    const H = totalH - M.top  - M.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", totalW).attr("height", totalH);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(CHART_DATA, d => d.date)).range([0, W]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(CHART_DATA, d => d.value)]).nice().range([H, 0]);

    // gridlines via negative tickSize
    if (grid) {
      g.append("g")
        .attr("transform", `translate(0,${H})`)
        .call(
          d3.axisBottom(x).ticks(ticks)
            .tickSize(-H)
            .tickFormat("")
        )
        .call(s => s.selectAll("path").remove())
        .call(s => s.selectAll("line")
          .attr("stroke", C.border)
          .attr("stroke-width", 0.6)
          .attr(dashed ? "stroke-dasharray" : "stroke-dasharray", dashed ? "4,4" : null)
        );

      g.append("g")
        .call(
          d3.axisLeft(y).ticks(ticks)
            .tickSize(-W)
            .tickFormat("")
        )
        .call(s => s.selectAll("path").remove())
        .call(s => s.selectAll("line")
          .attr("stroke", C.border)
          .attr("stroke-width", 0.6)
          .attr(dashed ? "stroke-dasharray" : "stroke-dasharray", dashed ? "4,4" : null)
        );
    }

    // area + line
    g.append("path").datum(CHART_DATA)
      .attr("fill", C.green + "18")
      .attr("d", d3.area().x(d => x(d.date)).y0(H).y1(d => y(d.value)).curve(d3.curveMonotoneX));
    g.append("path").datum(CHART_DATA)
      .attr("fill", "none").attr("stroke", C.green).attr("stroke-width", 2)
      .attr("d", d3.line().x(d => x(d.date)).y(d => y(d.value)).curve(d3.curveMonotoneX));

    // regular axes on top
    g.append("g").attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(ticks).tickSize(size).tickFormat(d3.timeFormat("%b")))
      .call(applyAxisStyle);

    g.append("g")
      .call(d3.axisLeft(y).ticks(ticks).tickSize(size))
      .call(applyAxisStyle);

  }, [d3, grid, ticks, size, dashed]);

  return (
    <div>
      <Card title="// tickSize → gridlines" titleColor={C.green} badge="d3-axis">
        <CtrlRow>
          <SegControl label="gridlines:" value={grid} onChange={setGrid} color={C.green}
            options={[{ value: true, label: "увімкнено" }, { value: false, label: "вимкнено" }]} />
          <SegControl label="стиль:" value={dashed} onChange={setDashed} color={C.yellow}
            options={[{ value: true, label: "пунктир" }, { value: false, label: "суцільна" }]} />
          <SliderCtrl label="ticks:" min={2} max={10} value={ticks} onChange={setTicks} color={C.green} />
          <SliderCtrl label="tickSize:" min={2} max={12} value={size} onChange={setSize} color={C.orange} />
        </CtrlRow>
        <div style={{ background: C.s2, borderRadius: 8, overflow: "hidden" }}>
          <svg ref={svgRef} style={{ display: "block", width: "100%" }} />
        </div>
      </Card>

      <CodeBox color={C.green}>
        <Cm c="// gridlines = від'ємний tickSize що розтягується на всю ширину/висоту" />{"\n"}
        <Fn c="axisBottom" />(x){"\n"}
        {"  "}.<Fn c="tickSize" />(<Num c={`-height`} />){"  "}<Cm c="// лінії вгору на всю висоту" />{"\n"}
        {"  "}.<Fn c="tickFormat" />(<Str c='""' />){"    "}<Cm c="// прибираємо підписи" />{"\n\n"}
        <Fn c="axisLeft" />(y){"\n"}
        {"  "}.<Fn c="tickSize" />(<Num c="-width" />){"  "}<Cm c="// лінії вправо на всю ширину" />{"\n"}
        {"  "}.<Fn c="tickFormat" />(<Str c='""' />);{"\n\n"}
        <Cm c={`// звичайна вісь поверх — tickSize(${size})`} />{"\n"}
        <Fn c="axisBottom" />(x).<Fn c="tickSize" />(<Num c={String(size)} />).<Fn c="ticks" />(<Num c={String(ticks)} />);
      </CodeBox>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "axis",   label: "// axisBottom + axisLeft", color: C.accent  },
  { id: "format", label: "// tickFormat",            color: C.purple  },
  { id: "grid",   label: "// tickSize → gridlines",  color: C.green   },
];

export default function D3AxesDemo() {
  const [active, setActive] = useState("axis");
  const d3 = useD3();

  return (
    <div style={{
      background: C.bg, color: C.text, minHeight: "100vh",
      fontFamily: MONO, padding: "28px 22px", boxSizing: "border-box",
    }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input[type=range]{cursor:pointer} *::-webkit-scrollbar{width:5px} *::-webkit-scrollbar-thumb{background:#2a2c4a;border-radius:99px}`}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.accent, marginBottom: 6 }}>
          📐 D3 Axes
        </h1>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>
          // axisBottom · axisLeft · tickFormat · tickSize · gridlines
        </p>

        <TabBar tabs={TABS} active={active} onChange={setActive} />

        {!d3 && (
          <div style={{ color: C.muted, fontSize: 12, padding: "24px 0" }}>
            ⏳ завантажую D3...
          </div>
        )}

        {d3 && active === "axis"   && <AxisTab   d3={d3} />}
        {d3 && active === "format" && <FormatTab d3={d3} />}
        {d3 && active === "grid"   && <GridTab   d3={d3} />}

        <div style={{
          background: C.s2, border: `1px solid ${C.yellow}44`,
          borderRadius: 12, padding: "14px 18px", fontSize: 13, lineHeight: 1.9, marginTop: 8,
        }}>
          <span style={{ color: C.yellow, fontWeight: 700 }}>💡 Ключова ідея D3 axes:</span><br />
          <span style={{ color: C.muted }}>Вісь — це </span>
          <code style={{ color: C.accent }}>g.call(axis)</code>
          <span style={{ color: C.muted }}>. D3 сам малює tick-и, підписи, лінію. Gridlines — </span>
          <code style={{ color: C.orange }}>tickSize(-width)</code>
          <span style={{ color: C.muted }}> + </span>
          <code style={{ color: C.green }}>tickFormat("")</code>
          <span style={{ color: C.muted }}>. 🎯</span>
        </div>

      </div>
    </div>
  );
}
