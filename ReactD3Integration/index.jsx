import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", muted: "#565f89",
  text: "#c0caf5", dimText: "#3d4466",
};

const DATA = [
  { id: 1, name: "Jan", value: 38 }, { id: 2, name: "Feb", value: 72 },
  { id: 3, name: "Mar", value: 45 }, { id: 4, name: "Apr", value: 91 },
  { id: 5, name: "May", value: 60 }, { id: 6, name: "Jun", value: 83 },
  { id: 7, name: "Jul", value: 55 }, { id: 8, name: "Aug", value: 78 },
];

const W = 460, H = 260, MARGIN = { top: 20, right: 20, bottom: 36, left: 44 };
const IW = W - MARGIN.left - MARGIN.right;
const IH = H - MARGIN.top - MARGIN.bottom;

// ── Підхід 1: D3 керує DOM + zoom ────────────────────────────────────────────
function ChartD3DOM({ data }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const x = d3.scaleBand().domain(data.map(d => d.name)).range([0, IW]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 100]).range([IH, 0]);

    svg.append("defs").append("clipPath").attr("id", "clip64")
      .append("rect").attr("width", IW).attr("height", IH);

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const xAxisG = g.append("g").attr("transform", `translate(0,${IH})`);
    const yAxisG = g.append("g");

    const axisStyle = ax => ax
      .call(a => a.select(".domain").attr("stroke", C.border))
      .call(a => a.selectAll(".tick line").attr("stroke", C.border))
      .call(a => a.selectAll("text").attr("fill", C.muted).attr("font-size", 11)
        .attr("font-family", "JetBrains Mono, monospace"));

    xAxisG.call(d3.axisBottom(x).tickSize(0)).call(axisStyle)
      .call(a => a.selectAll("text").attr("dy", "1.2em"));
    yAxisG.call(d3.axisLeft(y).ticks(4).tickSize(-IW))
      .call(a => a.select(".domain").remove())
      .call(a => a.selectAll(".tick line").attr("stroke", C.border).attr("stroke-dasharray", "3,3"))
      .call(axisStyle).call(a => a.selectAll("text").attr("dx", "-4"));

    const barsG = g.append("g").attr("clip-path", "url(#clip64)");
    const tooltip = d3.select(tooltipRef.current);

    const bars = barsG.selectAll(".bar")
      .data(data).join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => IH - y(d.value))
      .attr("fill", C.purple).attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("fill", C.accent);
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        tooltip.style("opacity", 1)
          .html(`<span style="color:${C.muted};font-size:10px">// d3 zoom active</span><br/><span style="color:${C.accent};font-weight:700">${d.name}</span> <span style="color:${C.green}">${d.value}</span>`)
          .style("left", (event.clientX - rect.left + 12) + "px")
          .style("top", (event.clientY - rect.top - 54) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", C.purple);
        tooltip.transition().duration(180).style("opacity", 0);
      });

    // ── zoom — D3 має повний контроль тому zoom природній ──
    const zoom = d3.zoom()
      .scaleExtent([1, 4])
      .translateExtent([[0, 0], [IW, IH]])
      .extent([[0, 0], [IW, IH]])
      .on("zoom", (event) => {
        const t = event.transform;
        const newX = t.rescaleX(x.copy().range([0, IW]));

        // перераховуємо позиції барів
        bars
          .attr("x", d => newX(d.name) - (newX.step ? 0 : 0))
          .attr("width", () => {
            // при zoom збільшуємо ширину бару пропорційно
            return x.bandwidth() * t.k;
          })
          .attr("x", d => {
            const newRange = [t.applyX(x(d.name)), t.applyX(x(d.name) + x.bandwidth())];
            return newRange[0];
          })
          .attr("width", d => {
            const newRange = [t.applyX(x(d.name)), t.applyX(x(d.name) + x.bandwidth())];
            return Math.max(0, newRange[1] - newRange[0]);
          });

        xAxisG.call(d3.axisBottom(x).tickSize(0)
          .tickFormat((name) => {
            const px = t.applyX(x(name) + x.bandwidth() / 2);
            return px >= 0 && px <= IW ? name : "";
          }))
          .call(axisStyle)
          .call(a => a.selectAll("text").attr("dy", "1.2em"));
      });

    stateRef.current.zoom = zoom;
    svg.call(zoom);
    svg.on("dblclick.zoom", null);

  }, [data]);

  const handleReset = () => {
    d3.select(svgRef.current).transition().duration(400)
      .call(stateRef.current.zoom.transform, d3.zoomIdentity);
  };

  return (
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: C.dimText }}>scroll — zoom · drag — pan</span>
        <button onClick={handleReset} style={{
          background: "transparent", border: `1px solid ${C.border}`,
          borderRadius: 6, padding: "2px 8px", color: C.muted,
          fontSize: 10, cursor: "pointer", fontFamily: "inherit",
        }}
          onMouseEnter={e => { e.target.style.color = C.accent; e.target.style.borderColor = C.accent; }}
          onMouseLeave={e => { e.target.style.color = C.muted; e.target.style.borderColor = C.border; }}
        >↺ reset</button>
      </div>
    </div>
  );
}

// ── Підхід 2: React керує DOM + CSS анімація ──────────────────────────────────
function ChartReactDOM({ data }) {
  const [hovered, setHovered] = useState(null);
  const [animated, setAnimated] = useState(false);

  // mount анімація
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  // D3 тільки рахує
  const x = d3.scaleBand().domain(data.map(d => d.name)).range([0, IW]).padding(0.3);
  const y = d3.scaleLinear().domain([0, 100]).range([IH, 0]);
  const yTicks = y.ticks(4);

  return (
    <div>
      <svg width={W} height={H} style={{ display: "block", maxWidth: "100%", overflow: "visible" }}>
        <defs>
          <style>{`
            .react-bar {
              transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                          y 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                          fill 0.15s;
            }
          `}</style>
        </defs>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* grid */}
          {yTicks.map(t => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x1={0} x2={IW} stroke={C.border} strokeDasharray="3,3" />
              <text x={-8} dy="0.32em" fill={C.muted} fontSize={11}
                fontFamily="JetBrains Mono, monospace" textAnchor="end">{t}</text>
            </g>
          ))}
          <line x1={0} x2={IW} y1={IH} y2={IH} stroke={C.border} />

          {/* x labels */}
          {data.map(d => (
            <text key={d.id}
              x={x(d.name) + x.bandwidth() / 2} y={IH + 18}
              fill={C.muted} fontSize={11} fontFamily="JetBrains Mono, monospace"
              textAnchor="middle">{d.name}</text>
          ))}

          {/* bars — React рендерить, CSS анімує */}
          {data.map(d => {
            const barH = animated ? IH - y(d.value) : 0;
            const barY = animated ? y(d.value) : IH;
            const isHovered = hovered?.id === d.id;
            return (
              <g key={d.id}>
                <rect
                  className="react-bar"
                  x={x(d.name)}
                  y={barY}
                  width={x.bandwidth()}
                  height={barH}
                  fill={isHovered ? C.accent : C.green}
                  rx={4}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                />
                {/* value label при hover */}
                {isHovered && (
                  <text
                    x={x(d.name) + x.bandwidth() / 2}
                    y={y(d.value) - 8}
                    fill={C.accent} fontSize={12} fontWeight="700"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >{d.value}</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div style={{ fontSize: 10, color: C.dimText, marginTop: 6, textAlign: "center" }}>
        анімація через CSS transition · hover — значення
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("d3");

  const approaches = {
    d3: {
      color: C.purple,
      label: "// D3 керує DOM",
      desc: <><span style={{ color: C.purple }}>useRef</span> + <span style={{ color: C.accent }}>d3.select()</span> + <span style={{ color: "#e0af68" }}>d3.zoom()</span></>,
      tags: ["useRef + useEffect", "d3.selectAll().join()", "d3.zoom()", "повний контроль"],
    },
    react: {
      color: C.green,
      label: "// React керує DOM",
      desc: <><span style={{ color: C.green }}>D3 рахує</span> + <span style={{ color: C.accent }}>JSX рендерить</span> + <span style={{ color: C.green }}>CSS анімує</span></>,
      tags: ["d3.scale()", "JSX + useState", "CSS transition", "Virtual DOM"],
    },
  };

  const current = approaches[active];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 20px", boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: 2 }}>REACT + D3</div>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>
            Два підходи інтеграції
          </h1>
        </div>

        <div style={{ display: "flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
          {Object.entries(approaches).map(([key, val]) => (
            <button key={key} onClick={() => setActive(key)} style={{
              flex: 1,
              background: active === key ? val.color + "22" : "transparent",
              border: `1px solid ${active === key ? val.color : "transparent"}`,
              borderRadius: 7, padding: "8px 0",
              color: active === key ? val.color : C.muted,
              fontSize: 12, fontWeight: active === key ? 700 : 400,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>{val.label}</button>
          ))}
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 16px 12px", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{current.desc}</div>
          {active === "d3"
            ? <ChartD3DOM data={DATA} />
            : <ChartReactDOM key="react" data={DATA} />
          }
        </div>

        <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: C.muted, width: "100%", marginBottom: 2 }}>
            {active === "d3" ? "// що використовує D3 підхід" : "// що використовує React підхід"}
          </span>
          {current.tags.map(tag => (
            <span key={tag} style={{
              background: current.color + "18", border: `1px solid ${current.color}44`,
              borderRadius: 6, padding: "3px 10px", fontSize: 12, color: current.color,
            }}>{tag}</span>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.muted }}>@nby.frontend</div>
      </div>
    </div>
  );
}
