import { useEffect, useRef } from "react";
import * as d3 from "d3";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", muted: "#565f89",
  text: "#c0caf5", dimText: "#3d4466",
};

const W = 460, H = 320, MARGIN = { top: 24, right: 24, bottom: 40, left: 48 };
const IW = W - MARGIN.left - MARGIN.right;
const IH = H - MARGIN.top - MARGIN.bottom;

// generate 200 points — day of year (1–365) vs value with some trend + noise
function generateData() {
  const rng = d3.randomNormal(0, 12);
  return Array.from({ length: 200 }, (_, i) => {
    const day = Math.floor(Math.random() * 365) + 1;
    const trend = 20 + (day / 365) * 60;
    return { day, value: Math.max(1, Math.min(99, trend + rng())) };
  }).sort((a, b) => a.day - b.day);
}

const DATA = generateData();

export default function App() {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const zoomRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // clip path so dots don't spill outside axes on zoom
    svg.append("defs").append("clipPath").attr("id", "chart-clip")
      .append("rect").attr("width", IW).attr("height", IH);

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const x = d3.scaleLinear().domain([1, 365]).range([0, IW]);
    const y = d3.scaleLinear().domain([0, 100]).range([IH, 0]);

    // axes
    const xAxisG = g.append("g").attr("transform", `translate(0,${IH})`);
    const yAxisG = g.append("g");

    const axisStyle = ax => ax
      .call(a => a.select(".domain").attr("stroke", C.border))
      .call(a => a.selectAll(".tick line").attr("stroke", C.border))
      .call(a => a.selectAll("text").attr("fill", C.muted).attr("font-size", 11).attr("font-family", "JetBrains Mono, monospace"));

    xAxisG.call(d3.axisBottom(x).ticks(6).tickFormat(d => `day ${d}`)).call(axisStyle);
    yAxisG.call(d3.axisLeft(y).ticks(5).tickSize(-IW))
      .call(a => a.select(".domain").remove())
      .call(a => a.selectAll(".tick line").attr("stroke", C.border).attr("stroke-dasharray", "3,3"))
      .call(a => a.selectAll("text").attr("fill", C.muted).attr("font-size", 11).attr("font-family", "JetBrains Mono, monospace").attr("dx", "-4"));

    // axis labels
    g.append("text").attr("x", IW / 2).attr("y", IH + 36)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
      .attr("font-family", "JetBrains Mono, monospace").text("день року");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -IH / 2).attr("y", -38)
      .attr("text-anchor", "middle").attr("fill", C.muted).attr("font-size", 11)
      .attr("font-family", "JetBrains Mono, monospace").text("значення");

    // dots group with clip
    const dotsG = g.append("g").attr("clip-path", "url(#chart-clip)");

    const tooltip = d3.select(tooltipRef.current);
    let activeEl = null;

    dotsG.selectAll(".dot")
      .data(DATA).join("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.day))
      .attr("cy", d => y(d.value))
      .attr("r", 4)
      .attr("fill", C.purple)
      .attr("fill-opacity", 0.7)
      .attr("stroke", C.purple)
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        if (activeEl) d3.select(activeEl).attr("fill", C.purple).attr("fill-opacity", 0.7).attr("r", 4);
        activeEl = this;
        d3.select(this).attr("fill", C.accent).attr("fill-opacity", 1).attr("r", 6);
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        tooltip
          .style("opacity", 1)
          .html(`<span style="color:${C.muted};font-size:10px">// dot</span><br/><span style="color:${C.accent}">day ${d.day}</span> <span style="color:${C.green}">${d.value.toFixed(1)}</span>`)
          .style("left", (event.clientX - rect.left + 12) + "px")
          .style("top", (event.clientY - rect.top - 54) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", C.purple).attr("fill-opacity", 0.7).attr("r", 4);
        activeEl = null;
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // zoom
    const zoom = d3.zoom()
      .scaleExtent([1, 20])
      .translateExtent([[0, 0], [IW, IH]])
      .extent([[0, 0], [IW, IH]])
      .on("zoom", (event) => {
        const t = event.transform;
        const newX = t.rescaleX(x);
        const newY = t.rescaleY(y);

        xAxisG.call(d3.axisBottom(newX).ticks(6).tickFormat(d => `day ${Math.round(d)}`)).call(axisStyle);
        yAxisG.call(d3.axisLeft(newY).ticks(5).tickSize(-IW))
          .call(a => a.select(".domain").remove())
          .call(a => a.selectAll(".tick line").attr("stroke", C.border).attr("stroke-dasharray", "3,3"))
          .call(a => a.selectAll("text").attr("fill", C.muted).attr("font-size", 11).attr("font-family", "JetBrains Mono, monospace").attr("dx", "-4"));

        dotsG.selectAll(".dot")
          .attr("cx", d => newX(d.day))
          .attr("cy", d => newY(d.value));
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // disable double-click zoom default
    svg.on("dblclick.zoom", null);

  }, []);

  const handleReset = () => {
    d3.select(svgRef.current)
      .transition().duration(400)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 20px", boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 2 }}>D3 З НУЛЯ #5</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>
            d3.zoom() — scatter plot
          </h1>
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 16px 14px", marginBottom: 12, position: "relative" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><span style={{ color: C.purple }}>scroll</span> — zoom · <span style={{ color: C.accent }}>drag</span> — pan · <span style={{ color: C.green }}>hover</span> — дані</span>
            <button onClick={handleReset} style={{
              background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "3px 10px", color: C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}
            >
              ↺ reset
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <div ref={tooltipRef} style={{
              position: "absolute", pointerEvents: "none",
              background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "7px 12px",
              fontSize: 13, fontFamily: "JetBrains Mono, monospace",
              color: C.text, opacity: 0, transition: "opacity 0.15s",
              zIndex: 10, whiteSpace: "nowrap", lineHeight: 1.7,
            }} />
            <svg ref={svgRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", cursor: "grab" }} />
          </div>

          <div style={{ fontSize: 10, color: C.dimText, marginTop: 8, textAlign: "center" }}>
            200 точок · zoom до 20x
          </div>
        </div>

        <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
          <span style={{ color: C.purple }}>scaleExtent</span>([1, 20]) ·{" "}
          <span style={{ color: C.accent }}>translateExtent</span>([[0,0],[W,H]]) ·{" "}
          <span style={{ color: C.green }}>rescaleX/Y</span>(x/y)
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.muted }}>@nby.frontend</div>
      </div>
    </div>
  );
}
