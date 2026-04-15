import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", muted: "#565f89", text: "#c0caf5", dimText: "#3d4466",
};

const DATA = [
  { name: "Jan", value: 42 }, { name: "Feb", value: 67 },
  { name: "Mar", value: 31 }, { name: "Apr", value: 85 },
  { name: "May", value: 54 }, { name: "Jun", value: 73 },
  { name: "Jul", value: 48 },
];

const W = 460, H = 260, MARGIN = { top: 24, right: 24, bottom: 36, left: 40 };
const IW = W - MARGIN.left - MARGIN.right;
const IH = H - MARGIN.top - MARGIN.bottom;

function buildScales() {
  const x = d3.scalePoint().domain(DATA.map(d => d.name)).range([0, IW]).padding(0.3);
  const y = d3.scaleLinear().domain([0, 100]).range([IH, 0]);
  return { x, y };
}

function drawChart(g, x, y, lineColor) {
  g.append("g")
    .call(d3.axisLeft(y).ticks(4).tickSize(-IW))
    .call(ax => ax.select(".domain").remove())
    .call(ax => ax.selectAll(".tick line").attr("stroke", C.border).attr("stroke-dasharray", "3,3"))
    .call(ax => ax.selectAll("text").attr("fill", C.muted).attr("font-size", 11).attr("font-family", "JetBrains Mono, monospace").attr("dx", "-4"));

  g.append("g").attr("transform", `translate(0,${IH})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call(ax => ax.select(".domain").attr("stroke", C.border))
    .call(ax => ax.selectAll("text").attr("fill", C.muted).attr("font-size", 12).attr("font-family", "JetBrains Mono, monospace").attr("dy", "1.2em"));

  const defs = g.append("defs");
  const gradId = `grad-${lineColor.replace("#", "")}`;
  const grad = defs.append("linearGradient").attr("id", gradId).attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 1);
  grad.append("stop").attr("offset", "0%").attr("stop-color", lineColor).attr("stop-opacity", 0.22);
  grad.append("stop").attr("offset", "100%").attr("stop-color", lineColor).attr("stop-opacity", 0.02);

  g.append("path").datum(DATA)
    .attr("fill", `url(#${gradId})`)
    .attr("d", d3.area().x(d => x(d.name)).y0(IH).y1(d => y(d.value)).curve(d3.curveCatmullRom.alpha(0.5)));

  g.append("path").datum(DATA)
    .attr("fill", "none").attr("stroke", lineColor).attr("stroke-width", 2)
    .attr("d", d3.line().x(d => x(d.name)).y(d => y(d.value)).curve(d3.curveCatmullRom.alpha(0.5)));

  g.selectAll(".dot").data(DATA).join("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.name)).attr("cy", d => y(d.value))
    .attr("r", 4).attr("fill", C.surface2)
    .attr("stroke", lineColor).attr("stroke-width", 2);
}

// ── DIV tooltip — uses mousemove + bisect, no per-point zones ────────────────
function ChartDiv() {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const { x, y } = buildScales();
    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
    drawChart(g, x, y, C.purple);

    const tooltip = d3.select(tooltipRef.current);
    const xValues = DATA.map(d => x(d.name));
    let activeIdx = -1;

    // crosshair line
    const crosshair = g.append("line")
      .attr("stroke", C.muted).attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3").attr("y1", 0).attr("y2", IH)
      .style("opacity", 0);

    // full overlay for mousemove
    g.append("rect")
      .attr("width", IW).attr("height", IH)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", function(event) {
        const [mx] = d3.pointer(event, g.node());
        // find nearest point
        const distances = xValues.map(xv => Math.abs(xv - mx));
        const idx = distances.indexOf(Math.min(...distances));
        const d = DATA[idx];
        const px = x(d.name);

        crosshair.attr("x1", px).attr("x2", px).style("opacity", 1);

        // update dots
        if (idx !== activeIdx) {
          if (activeIdx >= 0) g.selectAll(".dot").filter((_, i) => i === activeIdx).attr("fill", C.surface2).attr("r", 4);
          g.selectAll(".dot").filter((_, i) => i === idx).attr("fill", C.purple).attr("r", 6);
          activeIdx = idx;
        }

        const containerRect = svgRef.current.parentElement.getBoundingClientRect();
        tooltip
          .style("opacity", 1)
          .html(`<span style="color:${C.muted};font-size:10px">// div tooltip</span><br/><span style="color:${C.accent};font-weight:700">${d.name}</span> <span style="color:${C.green}">${d.value}</span>`)
          .style("left", (event.clientX - containerRect.left + 14) + "px")
          .style("top", (event.clientY - containerRect.top - 56) + "px");
      })
      .on("mouseleave", function() {
        crosshair.style("opacity", 0);
        if (activeIdx >= 0) g.selectAll(".dot").filter((_, i) => i === activeIdx).attr("fill", C.surface2).attr("r", 4);
        activeIdx = -1;
        tooltip.transition().duration(180).style("opacity", 0);
      });
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div ref={tooltipRef} style={{
        position: "absolute", pointerEvents: "none",
        background: C.surface2, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "7px 12px",
        fontSize: 13, fontFamily: "JetBrains Mono, monospace",
        color: C.text, opacity: 0, transition: "opacity 0.15s",
        zIndex: 10, whiteSpace: "nowrap", lineHeight: 1.7,
      }} />
      <svg ref={svgRef} width={W} height={H} style={{ display: "block", maxWidth: "100%" }} />
    </div>
  );
}

// ── SVG tooltip — appended LAST, measures AFTER text set ─────────────────────
function ChartSVG() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const { x, y } = buildScales();
    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
    drawChart(g, x, y, C.green);

    const xValues = DATA.map(d => x(d.name));
    let activeIdx = -1;

    const crosshair = g.append("line")
      .attr("stroke", C.muted).attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3").attr("y1", 0).attr("y2", IH)
      .style("opacity", 0);

    // ── SVG tooltip group — last in DOM ──
    const tip = g.append("g").style("opacity", 0).style("pointer-events", "none");
    const TIP_PAD = 10, TIP_H = 46;
    const tipRect = tip.append("rect").attr("rx", 6).attr("height", TIP_H)
      .attr("fill", C.surface2).attr("stroke", C.green).attr("stroke-width", 1);
    const tipComment = tip.append("text")
      .attr("font-family", "JetBrains Mono, monospace").attr("font-size", 10)
      .attr("fill", C.muted).attr("x", TIP_PAD).attr("y", 16);
    const tipName = tip.append("text")
      .attr("font-family", "JetBrains Mono, monospace").attr("font-size", 13)
      .attr("font-weight", "700").attr("fill", C.accent)
      .attr("x", TIP_PAD).attr("y", 34);
    const tipVal = tip.append("text")
      .attr("font-family", "JetBrains Mono, monospace").attr("font-size", 13)
      .attr("fill", C.green).attr("y", 34);

    // full overlay rect for mousemove
    g.append("rect")
      .attr("width", IW).attr("height", IH)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", function(event) {
        const [mx, my] = d3.pointer(event, g.node());
        const distances = xValues.map(xv => Math.abs(xv - mx));
        const idx = distances.indexOf(Math.min(...distances));
        const d = DATA[idx];
        const px = x(d.name);

        crosshair.attr("x1", px).attr("x2", px).style("opacity", 1);

        if (idx !== activeIdx) {
          if (activeIdx >= 0) g.selectAll(".dot").filter((_, i) => i === activeIdx).attr("fill", C.surface2).attr("r", 4);
          g.selectAll(".dot").filter((_, i) => i === idx).attr("fill", C.green).attr("r", 6);
          activeIdx = idx;
        }

        // set text first
        tipComment.text("// svg tooltip");
        tipName.text(`${d.name}:`);
        tipVal.text(` ${d.value}`);

        // measure AFTER setting text — position tipVal after tipName
        const nbox = tipName.node().getBBox();
        tipVal.attr("x", nbox.x + nbox.width);

        // measure full width after positioning
        const cbox = tipComment.node().getBBox();
        const fullRow = tipVal.node().getBBox();
        const tw = Math.max(
          cbox.width + TIP_PAD * 2,
          fullRow.x + fullRow.width + TIP_PAD
        );
        tipRect.attr("width", tw);

        // position tooltip — avoid edges
        const tx = mx + 14 + tw > IW ? mx - tw - 8 : mx + 14;
        const ty = my - TIP_H - 10 < 0 ? my + 10 : my - TIP_H - 10;
        tip.attr("transform", `translate(${tx},${ty})`).style("opacity", 1);
      })
      .on("mouseleave", function() {
        crosshair.style("opacity", 0);
        if (activeIdx >= 0) g.selectAll(".dot").filter((_, i) => i === activeIdx).attr("fill", C.surface2).attr("r", 4);
        activeIdx = -1;
        tip.transition().duration(180).style("opacity", 0);
      });
  }, []);

  return <svg ref={svgRef} width={W} height={H} style={{ display: "block", maxWidth: "100%" }} />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("div");
  const tags = {
    div: ["position: absolute", "event.pageX / pageY", "HTML всередині", "виходить за SVG"],
    svg: ["d3.pointer()", "rect + text", "все в SVG", "ідеально для export"],
  };
  const tagColors = { div: C.purple, svg: C.green };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 20px", boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 2 }}>D3 З НУЛЯ #4</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>Tooltip: два підходи</h1>
        </div>

        <div style={{ display: "flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
          {["div", "svg"].map(mode => (
            <button key={mode} onClick={() => setActive(mode)} style={{
              flex: 1,
              background: active === mode ? tagColors[mode] + "22" : "transparent",
              border: `1px solid ${active === mode ? tagColors[mode] : "transparent"}`,
              borderRadius: 7, padding: "8px 0",
              color: active === mode ? tagColors[mode] : C.muted,
              fontSize: 13, fontWeight: active === mode ? 700 : 400,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>
              {mode === "div" ? "// div tooltip" : "// svg tooltip"}
            </button>
          ))}
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 16px 12px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
            {active === "div"
              ? <><span style={{ color: C.purple }}>mousemove</span> + <span style={{ color: C.accent }}>bisect</span> → <span style={{ color: C.green }}>div позиція</span></>
              : <><span style={{ color: C.green }}>mousemove</span> + <span style={{ color: C.accent }}>d3.pointer()</span> → <span style={{ color: C.green }}>rect + text</span></>
            }
          </div>
          {active === "div" ? <ChartDiv /> : <ChartSVG />}
          <div style={{ fontSize: 10, color: C.dimText, marginTop: 8, textAlign: "center" }}>
            рухай мишку по графіку
          </div>
        </div>

        <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.muted, width: "100%", marginBottom: 2 }}>
            {active === "div" ? "// div підхід" : "// svg підхід"}
          </span>
          {tags[active].map(tag => (
            <span key={tag} style={{
              background: tagColors[active] + "18",
              border: `1px solid ${tagColors[active]}44`,
              borderRadius: 6, padding: "3px 10px",
              fontSize: 12, color: tagColors[active],
            }}>{tag}</span>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.muted }}>@nby.frontend</div>
      </div>
    </div>
  );
}
