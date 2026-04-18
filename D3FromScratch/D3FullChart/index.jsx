import { useEffect, useRef } from "react";
import * as d3 from "d3";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", muted: "#565f89",
  text: "#c0caf5", dimText: "#3d4466",
};

const W = 460, H = 300, MARGIN = { top: 24, right: 24, bottom: 40, left: 48 };
const IW = W - MARGIN.left - MARGIN.right;
const IH = H - MARGIN.top - MARGIN.bottom;

const BADGES = [
  { label: "scales", color: C.purple },
  { label: "axes", color: C.accent },
  { label: "line + area", color: C.green },
  { label: "tooltip", color: C.orange },
  { label: "zoom", color: "#e0af68" },
];

// 500 points over 2024
function generateData() {
  const end = new Date();
  const daysBack = Math.floor(Math.random() * 301) + 500; // 500–800
  const start = new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const rng = d3.randomNormal(0, 8);
  return Array.from({ length: 500 }, () => {
    const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    const date = new Date(t);
    const dayOfYear = (date - start) / (1000 * 60 * 60 * 24);
    const trend = 20 + (dayOfYear / daysBack) * 40;
    const seasonal = Math.sin((dayOfYear / daysBack) * Math.PI * 2) * 10;
    return { date, value: Math.max(2, Math.min(75, trend + seasonal + rng())) };
  }).sort((a, b) => a.date - b.date);
}

const DATA = generateData();

export default function App() {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.append("defs").append("clipPath").attr("id", "clip59")
      .append("rect").attr("width", IW).attr("height", IH + 4).attr("y", -2);

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // ── scales ──
    const x = d3.scaleTime()
      .domain(d3.extent(DATA, d => d.date))
      .range([0, IW]);
    const y = d3.scaleLinear().domain([0, 100]).range([IH, 0]);

    // ── axes ──
    const xAxisFn = (scale) => d3.axisBottom(scale).ticks(6).tickSize(0)
      .tickFormat(d3.timeFormat("%b %d"));
    const yAxisFn = (scale) => d3.axisLeft(scale).ticks(5).tickSize(-IW);

    const axisTextStyle = ax => ax
      .call(a => a.selectAll("text").attr("fill", C.muted).attr("font-size", 10).attr("font-family", "JetBrains Mono, monospace"));

    const xAxisG = g.append("g").attr("transform", `translate(0,${IH})`)
      .call(xAxisFn(x)).call(axisTextStyle)
      .call(a => a.select(".domain").attr("stroke", C.border))
      .call(a => a.selectAll("text").attr("dy", "1.2em"));

    const yAxisG = g.append("g")
      .call(yAxisFn(y))
      .call(a => a.select(".domain").remove())
      .call(a => a.selectAll(".tick line").attr("stroke", C.border).attr("stroke-dasharray", "3,3"))
      .call(axisTextStyle)
      .call(a => a.selectAll("text").attr("dx", "-4"));

    // ── area + line ──
    const chartG = g.append("g").attr("clip-path", "url(#clip59)");

    const defs = svg.select("defs");
    const grad = defs.append("linearGradient").attr("id", "grad59")
      .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 1);
    grad.append("stop").attr("offset", "0%").attr("stop-color", C.purple).attr("stop-opacity", 0.3);
    grad.append("stop").attr("offset", "100%").attr("stop-color", C.purple).attr("stop-opacity", 0.02);

    const areaGen = (sx) => d3.area()
      .x(d => sx(d.date)).y0(IH).y1(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));
    const lineGen = (sx) => d3.line()
      .x(d => sx(d.date)).y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const areaPath = chartG.append("path").datum(DATA)
      .attr("fill", "url(#grad59)").attr("d", areaGen(x));

    const linePath = chartG.append("path").datum(DATA)
      .attr("fill", "none").attr("stroke", C.purple)
      .attr("stroke-width", 1.5).attr("d", lineGen(x));

    // ── tooltip ──
    const tooltip = d3.select(tooltipRef.current);
    const bisectDate = d3.bisector(d => d.date).left;
    const fmt = d3.timeFormat("%b %d");

    // crosshair
    const crosshair = chartG.append("line")
      .attr("stroke", C.muted).attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3").attr("y1", 0).attr("y2", IH)
      .style("opacity", 0).style("pointer-events", "none");

    const crossDot = chartG.append("circle")
      .attr("r", 5).attr("fill", C.surface2)
      .attr("stroke", C.accent).attr("stroke-width", 2)
      .style("opacity", 0).style("pointer-events", "none");

    // store current x scale for tooltip mousemove
    stateRef.current.currentX = x;

    g.append("rect").attr("width", IW).attr("height", IH)
      .attr("fill", "transparent").style("cursor", "crosshair")
      .on("mousemove", function(event) {
        const curX = stateRef.current.currentX;
        const [mx] = d3.pointer(event, g.node());
        const date = curX.invert(mx);
        const idx = bisectDate(DATA, date, 1);
        const d0 = DATA[idx - 1];
        const d1 = DATA[idx] || d0;
        const d = date - d0.date > d1.date - date ? d1 : d0;

        const px = curX(d.date);
        const py = y(d.value);

        crosshair.attr("x1", px).attr("x2", px).style("opacity", 1);
        crossDot.attr("cx", px).attr("cy", py).style("opacity", 1);

        const containerRect = svgRef.current.parentElement.getBoundingClientRect();
        tooltip.style("opacity", 1)
          .html(`<span style="color:${C.muted};font-size:10px">// tooltip</span><br/><span style="color:${C.accent};font-weight:700">${fmt(d.date)}</span> <span style="color:${C.green}">${d.value.toFixed(1)}</span>`)
          .style("left", (event.clientX - containerRect.left + 14) + "px")
          .style("top", (event.clientY - containerRect.top - 58) + "px");
      })
      .on("mouseleave", function() {
        crosshair.style("opacity", 0);
        crossDot.style("opacity", 0);
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // ── zoom ──
    const zoom = d3.zoom()
      .scaleExtent([1, 30])
      .translateExtent([[0, 0], [IW, IH]])
      .extent([[0, 0], [IW, IH]])
      .on("zoom", (event) => {
        const t = event.transform;
        const newX = t.rescaleX(x);
        stateRef.current.currentX = newX;

        xAxisG.call(xAxisFn(newX)).call(axisTextStyle)
          .call(a => a.select(".domain").attr("stroke", C.border))
          .call(a => a.selectAll("text").attr("dy", "1.2em"));

        areaPath.attr("d", areaGen(newX));
        linePath.attr("d", lineGen(newX));
      });

    stateRef.current.zoom = zoom;
    svg.call(zoom);
    svg.on("dblclick.zoom", null);

  }, []);

  const handleReset = () => {
    d3.select(svgRef.current)
      .transition().duration(400)
      .call(stateRef.current.zoom.transform, d3.zoomIdentity);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 20px", boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 2 }}>D3 З НУЛЯ — ФІНАЛ</div>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>
            Повний chart за 60 рядків
          </h1>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, justifyContent: "center" }}>
          {BADGES.map(b => (
            <span key={b.label} style={{
              background: b.color + "18", border: `1px solid ${b.color}44`,
              borderRadius: 6, padding: "3px 10px", fontSize: 11, color: b.color,
            }}>{b.label}</span>
          ))}
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 16px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><span style={{ color: C.purple }}>scroll</span> — zoom · <span style={{ color: C.accent }}>drag</span> — pan · <span style={{ color: C.green }}>hover</span> — tooltip</span>
            <button onClick={handleReset}
              style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}
            >↺ reset</button>
          </div>

          <div style={{ position: "relative" }}>
            <div ref={tooltipRef} style={{
              position: "absolute", pointerEvents: "none",
              background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "7px 12px", fontSize: 13,
              fontFamily: "JetBrains Mono, monospace", color: C.text,
              opacity: 0, transition: "opacity 0.15s", zIndex: 10,
              whiteSpace: "nowrap", lineHeight: 1.7,
            }} />
            <svg ref={svgRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", cursor: "grab" }} />
          </div>

          <div style={{ fontSize: 10, color: C.dimText, marginTop: 6, textAlign: "center" }}>
            500 точок · zoom до 30x
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: C.muted }}>@nby.frontend</div>
      </div>
    </div>
  );
}
