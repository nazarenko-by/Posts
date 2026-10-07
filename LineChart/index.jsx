// D3 завантажується через CDN в useEffect нижче.
// У проєкті з bundler: import * as d3 from "d3"
import { useEffect, useRef, useState } from "react";

// ── palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:      "#0a0d14",
  surface: "#1a1b2e",
  s2:      "#16213e",
  border:  "#2a2c4a",
  accent:  "#7dcfff",
  purple:  "#bb9af7",
  green:   "#9ece6a",
  orange:  "#ff9e64",
  yellow:  "#e0af68",
  muted:   "#565f89",
  text:    "#c0caf5",
};

const MONO = "'JetBrains Mono','Fira Code',monospace";

// ── data generators ───────────────────────────────────────────────────────────
function generateSeries(days, startVal, volatility, trend) {
  let v = startVal;
  const origin = new Date(2024, 0, 1);
  return Array.from({ length: days }, (_, i) => {
    v = Math.max(2, v + (Math.random() - 0.5 + trend) * volatility);
    return {
      date:  new Date(origin.getTime() + i * 864e5),
      value: +v.toFixed(2),
    };
  });
}

const SERIES = {
  btc:     { label: "BTC/USD",           color: C.orange, data: generateSeries(365, 45000, 2800, 0.04)  },
  temp:    { label: "Температура (°C)",  color: C.accent, data: generateSeries(365, 12,    3.5,  0.008) },
  traffic: { label: "Трафік (k req/s)",  color: C.green,  data: generateSeries(365, 120,   18,   0.015) },
};

// ── syntax helpers ────────────────────────────────────────────────────────────
const Kw  = ({ c }) => <span style={{ color: C.purple }}>{c}</span>;
const Fn  = ({ c }) => <span style={{ color: C.accent }}>{c}</span>;
const Str = ({ c }) => <span style={{ color: C.green  }}>{c}</span>;
const Num = ({ c }) => <span style={{ color: C.orange }}>{c}</span>;
const Cm  = ({ c }) => <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>;

// ── Chart ─────────────────────────────────────────────────────────────────────
const M = { top: 20, right: 24, bottom: 40, left: 62 };

function Chart({ seriesKey, series }) {
  const wrapRef  = useRef(null);
  const svgRef   = useRef(null);
  const resetRef = useRef(null);  // fn to reset zoom
  const [zoomK,  setZoomK]  = useState(1);
  const [tip,    setTip]    = useState(null);
  const [d3Ready, setD3Ready] = useState(!!window.d3);

  // ── load D3 once ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.d3) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js";
    s.onload = () => setD3Ready(true);
    document.head.appendChild(s);
  }, []);

  // ── build chart ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!d3Ready || !svgRef.current || !wrapRef.current) return;
    const d3 = window.d3;

    // dimensions
    const totalW = wrapRef.current.clientWidth || 700;
    const totalH = Math.round(Math.max(240, Math.min(360, totalW * 0.44)));
    const W = totalW - M.left - M.right;
    const H = totalH - M.top  - M.bottom;

    // unique ids
    const uid    = `lc-${seriesKey}`;
    const gradId = `${uid}-g`;
    const clipId = `${uid}-c`;

    // clear
    const svgEl = d3.select(svgRef.current)
      .attr("width",  totalW)
      .attr("height", totalH);
    svgEl.selectAll("*").remove();

    // ── defs ────────────────────────────────────────────────────────────────
    const defs = svgEl.append("defs");

    defs.append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0").attr("y1", "0")
      .attr("x2", "0").attr("y2", "1")
      .selectAll("stop")
      .data([
        { offset: "0%",   opacity: 0.24 },
        { offset: "100%", opacity: 0    },
      ])
      .join("stop")
      .attr("offset",       d => d.offset)
      .attr("stop-color",   series.color)
      .attr("stop-opacity", d => d.opacity);

    defs.append("clipPath").attr("id", clipId)
      .append("rect")
      .attr("x", 0).attr("y", -M.top)
      .attr("width", W).attr("height", H + M.top + 4);

    // ── scales ───────────────────────────────────────────────────────────────
    const xBase = d3.scaleTime()
      .domain(d3.extent(series.data, d => d.date))
      .range([0, W]);

    const y = d3.scaleLinear()
      .domain(d3.extent(series.data, d => d.value))
      .nice()
      .range([H, 0]);

    // xNow is rescaled on every zoom event
    let xNow = xBase.copy();

    // ── root group ───────────────────────────────────────────────────────────
    const g = svgEl.append("g")
      .attr("transform", `translate(${M.left},${M.top})`);

    // bg
    g.append("rect")
      .attr("width", W).attr("height", H)
      .attr("rx", 6).attr("fill", C.s2);

    // ── grid ─────────────────────────────────────────────────────────────────
    const tickStyle = sel =>
      sel.attr("font-family", MONO).attr("font-size", 10)
         .call(s => s.selectAll("path,line").attr("stroke", C.border))
         .call(s => s.selectAll("text").attr("fill", C.muted));

    const gGridX = g.append("g").attr("class", "gx");
    const gGridY = g.append("g").attr("class", "gy");

    function redrawGrid(x) {
      gGridX.selectAll("line").data(x.ticks(6)).join("line")
        .attr("x1", d => x(d)).attr("x2", d => x(d))
        .attr("y1", 0).attr("y2", H)
        .attr("stroke", C.border).attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "3,5");

      gGridY.selectAll("line").data(y.ticks(5)).join("line")
        .attr("x1", 0).attr("x2", W)
        .attr("y1", d => y(d)).attr("y2", d => y(d))
        .attr("stroke", C.border).attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "3,5");
    }
    redrawGrid(xNow);

    // ── generators ───────────────────────────────────────────────────────────
    const mkLine = x => d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const mkArea = x => d3.area()
      .x(d  => x(d.date))
      .y0(H)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // ── clipped paths ─────────────────────────────────────────────────────────
    const content = g.append("g").attr("clip-path", `url(#${clipId})`);

    const pathArea = content.append("path")
      .datum(series.data)
      .attr("fill", `url(#${gradId})`)
      .attr("d", mkArea(xNow));

    const pathLine = content.append("path")
      .datum(series.data)
      .attr("fill", "none")
      .attr("stroke", series.color)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("d", mkLine(xNow));

    // ── axes ──────────────────────────────────────────────────────────────────
    const xAxisG = g.append("g")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(xNow).ticks(6).tickFormat(d3.timeFormat("%d %b")))
      .call(tickStyle);

    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .call(tickStyle);

    // ── crosshair ─────────────────────────────────────────────────────────────
    const chV = content.append("line")
      .attr("y1", 0).attr("y2", H)
      .attr("stroke", series.color).attr("stroke-width", 0.8)
      .attr("stroke-dasharray", "3,3").attr("opacity", 0);

    const chH = content.append("line")
      .attr("x1", 0).attr("x2", W)
      .attr("stroke", series.color).attr("stroke-width", 0.8)
      .attr("stroke-dasharray", "3,3").attr("opacity", 0.3);

    const dot = content.append("circle")
      .attr("r", 4.5)
      .attr("fill", C.s2)
      .attr("stroke", series.color).attr("stroke-width", 2)
      .attr("opacity", 0);

    const bisect = d3.bisector(d => d.date).left;

    // ── mouse overlay ─────────────────────────────────────────────────────────
    g.append("rect")
      .attr("width", W).attr("height", H)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair")
      .on("mousemove", function(event) {
        const [mx] = d3.pointer(event, this);
        const date = xNow.invert(mx);
        const i    = bisect(series.data, date);
        const a    = series.data[Math.max(0, i - 1)];
        const b    = series.data[Math.min(i, series.data.length - 1)];
        const pt   = !a || (b && Math.abs(date - b.date) < Math.abs(date - a.date)) ? b : a;
        if (!pt) return;

        const px = xNow(pt.date);
        const py = y(pt.value);

        chV.attr("x1", px).attr("x2", px).attr("opacity", 0.55);
        chH.attr("y1", py).attr("y2", py).attr("opacity", 0.3);
        dot.attr("cx", px).attr("cy", py).attr("opacity", 1);

        // clamp tooltip to svg bounds
        const tipW = 150, tipH = 38;
        const absX = M.left + px;
        const absY = M.top  + py;
        const tx = absX + 14 + tipW > totalW ? absX - tipW - 14 : absX + 14;
        const ty = absY - tipH < 0 ? absY + 10 : absY - tipH;
        setTip({ x: tx, y: ty, date: pt.date, value: pt.value });
      })
      .on("mouseleave", () => {
        chV.attr("opacity", 0);
        chH.attr("opacity", 0);
        dot.attr("opacity", 0);
        setTip(null);
      });

    // ── zoom behavior ─────────────────────────────────────────────────────────
    const zoomBehavior = d3.zoom()
      .scaleExtent([1, 50])
      .translateExtent([[0, 0], [W, H]])
      .extent([[0, 0], [W, H]])
      .on("zoom", event => {
        const t = event.transform;
        xNow = t.rescaleX(xBase);

        pathArea.attr("d", mkArea(xNow));
        pathLine.attr("d", mkLine(xNow));

        const fmt = t.k > 5 ? d3.timeFormat("%d %b") : d3.timeFormat("%b %Y");
        xAxisG.call(d3.axisBottom(xNow).ticks(6).tickFormat(fmt)).call(tickStyle);

        redrawGrid(xNow);
        setZoomK(+t.k.toFixed(1));
      });

    svgEl.call(zoomBehavior);

    resetRef.current = () =>
      svgEl.transition().duration(350)
           .call(zoomBehavior.transform, d3.zoomIdentity);

  }, [d3Ready, seriesKey]);

  const fmt = new Intl.DateTimeFormat("uk", { day: "2-digit", month: "short" });

  return (
    <div style={{ position: "relative" }}>
      <div ref={wrapRef} style={{ width: "100%", overflow: "hidden", borderRadius: 8 }}>
        <svg ref={svgRef} style={{ display: "block", width: "100%" }} />
      </div>

      {tip && (
        <div style={{
          position: "absolute", left: tip.x, top: tip.y,
          background: C.surface, border: `1px solid ${series.color}88`,
          borderRadius: 8, padding: "5px 12px", fontSize: 11,
          fontFamily: MONO, whiteSpace: "nowrap",
          pointerEvents: "none", zIndex: 10,
        }}>
          <span style={{ color: C.muted }}>{fmt.format(tip.date)}</span>
          {"  "}
          <span style={{ color: series.color, fontWeight: 700 }}>
            {tip.value.toLocaleString("uk", { maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      <div style={{
        marginTop: 8, display: "flex", justifyContent: "flex-end",
        alignItems: "center", gap: 12, fontSize: 10,
        color: C.muted, fontFamily: MONO,
      }}>
        {zoomK > 1 && (
          <>
            <span style={{ color: series.color }}>zoom ×{zoomK}</span>
            <button onClick={() => resetRef.current?.()} style={{
              background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "2px 10px", fontSize: 10,
              fontFamily: MONO, color: C.muted, cursor: "pointer",
            }}>
              reset
            </button>
          </>
        )}
        <span>scroll = zoom · drag = pan</span>
      </div>
    </div>
  );
}

// ── Code tabs ─────────────────────────────────────────────────────────────────
const CTABS = [
  {
    label: "// scales",
    color: C.purple,
    title: "scaleTime + scaleLinear",
    code: (
      <>
        <Cm c="// час → піксель" />{"\n"}
        <Kw c="const" /> xBase = d3.<Fn c="scaleTime" />(){"\n"}
        {"  "}.<Fn c="domain" />(d3.<Fn c="extent" />(data, d ={">"} d.date)){"\n"}
        {"  "}.<Fn c="range" />([<Num c="0" />, W]);{"\n\n"}
        <Cm c="// значення → піксель (Y інвертована)" />{"\n"}
        <Kw c="const" /> y = d3.<Fn c="scaleLinear" />(){"\n"}
        {"  "}.<Fn c="domain" />(d3.<Fn c="extent" />(data, d ={">"} d.value)){"\n"}
        {"  "}.<Fn c="nice" />(){"    "}<Cm c="// округлює межі" />{"\n"}
        {"  "}.<Fn c="range" />([H, <Num c="0" />]);{"  "}<Cm c="// 0 зверху в SVG" />{"\n\n"}
        <Kw c="const" /> line = d3.<Fn c="line" />(){"\n"}
        {"  "}.<Fn c="x" />(d ={">"} xBase(d.date)){"\n"}
        {"  "}.<Fn c="y" />(d ={">"} y(d.value)){"\n"}
        {"  "}.<Fn c="curve" />(d3.<Fn c="curveMonotoneX" />);
      </>
    ),
  },
  {
    label: "// zoom",
    color: C.green,
    title: "zoom — rescaleX, не дані",
    code: (
      <>
        <Kw c="const" /> zoom = d3.<Fn c="zoom" />(){"\n"}
        {"  "}.<Fn c="scaleExtent" />([<Num c="1" />, <Num c="50" />]){"\n"}
        {"  "}.<Fn c="on" />(<Str c="'zoom'" />, event ={">"} {"{"}{"\n"}
        {"    "}<Cm c="// новий scale з урахуванням трансформації" />{"\n"}
        {"    "}<Kw c="const" /> xNow = event.transform.<Fn c="rescaleX" />(xBase);{"\n\n"}
        {"    "}<Cm c="// перемальовуємо тільки шлях і вісь" />{"\n"}
        {"    "}path.<Fn c="attr" />(<Str c="'d'" />, line.<Fn c="x" />(d ={">"} xNow(d.date)));{"\n"}
        {"    "}xAxis.<Fn c="call" />(d3.<Fn c="axisBottom" />(xNow));{"\n"}
        {"  "}{"}"});{"\n\n"}
        svg.<Fn c="call" />(zoom);{"\n\n"}
        <Cm c="// reset" />{"\n"}
        svg.<Fn c="call" />(zoom.<Fn c="transform" />, d3.<Fn c="zoomIdentity" />);
      </>
    ),
  },
  {
    label: "// tooltip",
    color: C.accent,
    title: "bisector — найближча точка",
    code: (
      <>
        <Kw c="const" /> bisect = d3.<Fn c="bisector" />(d ={">"} d.date).<Fn c="left" />;{"\n\n"}
        svg.<Fn c="on" />(<Str c="'mousemove'" />, (event) ={">"} {"{"}{"\n"}
        {"  "}<Cm c="// x-координата миші → дата" />{"\n"}
        {"  "}<Kw c="const" /> [mx] = d3.<Fn c="pointer" />(event);{"\n"}
        {"  "}<Kw c="const" /> date = xNow.<Fn c="invert" />(mx);{"\n\n"}
        {"  "}<Cm c="// знаходимо найближчий елемент" />{"\n"}
        {"  "}<Kw c="const" /> i  = <Fn c="bisect" />(data, date);{"\n"}
        {"  "}<Kw c="const" /> a  = data[i - <Num c="1" />], b = data[i];{"\n"}
        {"  "}<Kw c="const" /> pt = date - a.date {"<"} b.date - date ? a : b;{"\n\n"}
        {"  "}<Cm c="// px/py — координати крапки" />{"\n"}
        {"  "}<Kw c="const" /> px = xNow(pt.date), py = y(pt.value);{"\n"}
        {"}"});
      </>
    ),
  },
];

// ── Root ──────────────────────────────────────────────────────────────────────
export default function LineChartDemo() {
  const [sk,  setSk]  = useState("btc");
  const [ct,  setCt]  = useState(0);
  const series = SERIES[sk];

  const cardStyle = {
    background:   C.surface,
    border:       `1px solid ${C.border}`,
    borderRadius: 14,
    overflow:     "hidden",
    marginBottom: 16,
  };
  const hdrStyle = {
    background:   C.s2,
    padding:      "11px 20px",
    borderBottom: `1px solid ${C.border}`,
    display:      "flex",
    alignItems:   "center",
    justifyContent: "space-between",
    fontSize:     11,
    fontFamily:   MONO,
  };

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: MONO, padding: "28px 22px", boxSizing: "border-box" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } *::-webkit-scrollbar { width: 5px; } *::-webkit-scrollbar-thumb { background: #2a2c4a; border-radius: 99px; }`}</style>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.accent, marginBottom: 6 }}>
          📈 D3 Line Chart + Zoom
        </h1>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>
          // scaleTime · scaleLinear · zoom · pan · bisector tooltip
        </p>

        {/* dataset switch */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {Object.entries(SERIES).map(([k, s]) => (
            <button key={k} onClick={() => setSk(k)} style={{
              background:   sk === k ? s.color + "22" : "transparent",
              border:       `1px solid ${sk === k ? s.color : C.border}`,
              borderRadius: 8, padding: "6px 16px",
              fontSize: 12, fontFamily: MONO,
              color: sk === k ? s.color : C.muted,
              cursor: "pointer", transition: "all .15s",
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* chart */}
        <div style={cardStyle}>
          <div style={hdrStyle}>
            <span style={{ fontSize: 13, fontWeight: 600, color: series.color }}>{series.label}</span>
            <span style={{ color: C.muted }}>365 точок · scroll = zoom · drag = pan</span>
          </div>
          <div style={{ padding: 20 }}>
            <Chart key={sk} seriesKey={sk} series={series} />
          </div>
        </div>

        {/* code tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {CTABS.map((t, i) => (
            <button key={i} onClick={() => setCt(i)} style={{
              background:   ct === i ? t.color + "22" : "transparent",
              border:       `1px solid ${ct === i ? t.color : C.border}`,
              borderRadius: 8, padding: "6px 14px",
              fontSize: 12, fontFamily: MONO,
              color: ct === i ? t.color : C.muted,
              cursor: "pointer", transition: "all .15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={cardStyle}>
          <div style={hdrStyle}>
            <span style={{ fontSize: 13, fontWeight: 600, color: CTABS[ct].color }}>
              {CTABS[ct].title}
            </span>
            <span>d3-force.js</span>
          </div>
          <div style={{ padding: 20 }}>
            <pre style={{
              background: C.s2, borderRadius: 8,
              padding: "14px 18px", fontSize: 12, lineHeight: 1.9,
              borderLeft: `2px solid ${CTABS[ct].color}`,
              fontFamily: MONO, whiteSpace: "pre-wrap",
              overflowX: "auto", margin: 0,
            }}>
              {CTABS[ct].code}
            </pre>
          </div>
        </div>

        {/* tip */}
        <div style={{
          background: C.s2, border: `1px solid ${C.yellow}44`,
          borderRadius: 12, padding: "14px 18px", fontSize: 13, lineHeight: 1.9,
        }}>
          <span style={{ color: C.yellow, fontWeight: 700 }}>💡 Ключова ідея D3 zoom:</span><br />
          <span style={{ color: C.muted }}>Zoom не масштабує SVG. Він перераховує </span>
          <code style={{ color: C.accent }}>xBase</code>
          <span style={{ color: C.muted }}> через </span>
          <code style={{ color: C.orange }}>transform.rescaleX()</code>
          <span style={{ color: C.muted }}> → отримуємо </span>
          <code style={{ color: C.green }}>xNow</code>
          <span style={{ color: C.muted }}> і перемальовуємо тільки лінію і вісь. Дані не змінюються. 🎯</span>
        </div>

      </div>
    </div>
  );
}
