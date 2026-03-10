import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const data = [
  { language: "JavaScript", stars: 120 },
  { language: "Python",     stars: 95  },
  { language: "Rust",       stars: 80  },
  { language: "Go",         stars: 60  },
  { language: "TypeScript", stars: 105 },
];

const MARGIN = { top: 30, right: 30, bottom: 50, left: 60 };

export default function BarChart() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [dims, setDims] = useState({ width: 500, height: 320 });

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDims({ width: Math.max(300, width), height: 320 });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const { width, height } = dims;
    const innerW = width  - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top  - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.language))
      .range([0, innerW])
      .padding(0.35);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.stars) * 1.15])
      .range([innerH, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.language))
      .range(["#7dcfff", "#bb9af7", "#9ece6a", "#ff9e64", "#e0af68"]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).tickSize(-innerW).tickFormat("").ticks(5))
      .call(gg => gg.select(".domain").remove())
      .call(gg => gg.selectAll("line")
        .attr("stroke", "#2a2c4a")
        .attr("stroke-dasharray", "4,4"));

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call(gg => gg.select(".domain").attr("stroke", "#2a2c4a"))
      .call(gg => gg.selectAll("text")
        .attr("fill", "#a9b1d6")
        .attr("font-size", "12px")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("dy", "1.4em"));

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(0))
      .call(gg => gg.select(".domain").remove())
      .call(gg => gg.selectAll("text")
        .attr("fill", "#565f89")
        .attr("font-size", "11px")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("dx", "-0.5em"));

    // Bars
    g.selectAll("rect.bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x",      d => xScale(d.language))
      .attr("y",      innerH)
      .attr("width",  xScale.bandwidth())
      .attr("height", 0)
      .attr("rx", 4)
      .attr("fill", d => colorScale(d.language))
      .attr("opacity", d => hovered === null || hovered === d.language ? 1 : 0.35)
      .attr("cursor", "pointer")
      .on("mouseenter", (_, d) => setHovered(d.language))
      .on("mouseleave", () => setHovered(null))
      .transition().duration(700).ease(d3.easeCubicOut)
      .attr("y",      d => yScale(d.stars))
      .attr("height", d => innerH - yScale(d.stars));

    // Value labels
    g.selectAll("text.label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", d => xScale(d.language) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.stars) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", d => colorScale(d.language))
      .attr("font-size", "12px")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-weight", "700")
      .attr("opacity", 0)
      .text(d => d.stars)
      .transition().delay(600).duration(300)
      .attr("opacity", d => hovered === null || hovered === d.language ? 1 : 0.3);

  }, [dims, hovered]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0d14",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ color: "#565f89", fontSize: 12, marginBottom: 8, letterSpacing: 2 }}>
          // D3.js bar chart
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#c0caf5" }}>
          GitHub Stars by Language
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#565f89" }}>
          hover over bars to highlight
        </p>
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: 600,
          background: "#1a1b2e",
          border: "1px solid #2a2c4a",
          borderRadius: 16,
          padding: "24px 16px 16px",
        }}
      >
        <svg ref={svgRef} style={{ width: "100%", overflow: "visible" }} />
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: 16,
        marginTop: 24,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {data.map((d, i) => {
          const colors = ["#7dcfff","#bb9af7","#9ece6a","#ff9e64","#e0af68"];
          return (
            <div
              key={d.language}
              onMouseEnter={() => setHovered(d.language)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                cursor: "pointer",
                opacity: hovered === null || hovered === d.language ? 1 : 0.4,
                transition: "opacity 0.2s",
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: 2,
                background: colors[i],
              }} />
              <span style={{ fontSize: 11, color: "#a9b1d6" }}>{d.language}</span>
            </div>
          );
        })}
      </div>

      {/* Code hint */}
      <div style={{
        marginTop: 32,
        background: "#1a1b2e",
        border: "1px solid #2a2c4a",
        borderRadius: 10,
        padding: "12px 20px",
        maxWidth: 600,
        width: "100%",
      }}>
        <span style={{ color: "#565f89", fontSize: 11 }}>// key concept: </span>
        <span style={{ color: "#bb9af7", fontSize: 11 }}>scales </span>
        <span style={{ color: "#a9b1d6", fontSize: 11 }}>transform data → pixels</span>
      </div>
    </div>
  );
}