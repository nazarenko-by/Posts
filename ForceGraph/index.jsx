import { useState, useEffect, useRef, useCallback } from "react";

// D3 is loaded via CDN — assume d3 is available on window
// In your project: import * as d3 from "d3";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

const NODE_LABELS = ["JS","React","D3","Node","CSS","TS","Vite","Vue","Svelte","RxJS","Redux","Next","Remix","Astro","Bun"];
const NODE_COLORS = [C.accent, C.purple, C.green, C.orange, C.yellow];

const INITIAL_NODES = [
  { id: "JS",    color: C.orange  },
  { id: "React", color: C.accent  },
  { id: "D3",    color: C.green   },
  { id: "Node",  color: C.purple  },
  { id: "CSS",   color: C.yellow  },
  { id: "TS",    color: C.accent  },
  { id: "Vite",  color: C.green   },
  { id: "Vue",   color: C.green   },
];

const INITIAL_LINKS = [
  { source: "JS",    target: "React" },
  { source: "JS",    target: "D3"    },
  { source: "JS",    target: "Node"  },
  { source: "JS",    target: "TS"    },
  { source: "React", target: "CSS"   },
  { source: "React", target: "Vite"  },
  { source: "TS",    target: "React" },
  { source: "Node",  target: "JS"    },
  { source: "Vue",   target: "JS"    },
  { source: "D3",    target: "CSS"   },
];

// ─── Slider control ───────────────────────────────────────────────────────────
function SliderCtrl({ label, min, max, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <label style={{ fontSize: 11, color: C.muted }}>{label}</label>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: 80, accentColor: C.accent, cursor: "pointer" }}
      />
      <span style={{ fontSize: 12, color: C.orange, minWidth: 36 }}>{value}</span>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function Stat({ value, label, color }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: "8px 14px", fontSize: 11 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color, display: "block" }}>{value}</span>
      <span style={{ color: C.muted }}>{label}</span>
    </div>
  );
}

// ─── Force info card ──────────────────────────────────────────────────────────
function ForceCard({ name, color, desc }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 10, padding: "12px 14px", border: `1px solid ${color}33` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 6 }}>{name}</div>
      <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ForceGraph() {
  const svgRef = useRef(null);
  const simRef = useRef(null);
  const nodesRef = useRef(null);
  const linksRef = useRef(null);

  const [charge, setCharge] = useState(-200);
  const [linkDist, setLinkDist] = useState(80);
  const [collision, setCollision] = useState(28);

  const [alpha, setAlpha] = useState(1);
  const [tickCount, setTickCount] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  const [linkCount, setLinkCount] = useState(0);

  const W = 600, H = 380;

  // ── deep-clone initial data ──
  const cloneData = () => ({
    nodes: INITIAL_NODES.map(n => ({ ...n })),
    links: INITIAL_LINKS.map(l => ({ ...l })),
  });

  // ── build / rebuild simulation ──────────────────────────────────────────────
  const buildSim = useCallback((nodes, links, chargeVal, ldistVal, collVal) => {
    const d3 = window.d3;
    if (!d3 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // measure actual width
    const rect = svgRef.current.getBoundingClientRect();
    const svgW = rect.width || W;
    svgRef.current.setAttribute("viewBox", `0 0 ${svgW} ${H}`);

    svg.selectAll("*").remove();

    // arrow marker
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 20).attr("refY", 0)
      .attr("markerWidth", 6).attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path").attr("d", "M0,-4L8,0L0,4").attr("fill", C.border);

    // links
    const linkSel = svg.append("g").selectAll("line")
      .data(links).join("line")
      .attr("stroke", C.border)
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    // node groups
    const nodeG = svg.append("g").selectAll("g")
      .data(nodes).join("g")
      .attr("cursor", "pointer");

    // outer glow ring
    nodeG.append("circle")
      .attr("r", 28)
      .attr("fill", "transparent")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.2);

    // main circle
    nodeG.append("circle")
      .attr("r", 22)
      .attr("fill", d => d.color + "22")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 1.5);

    // label
    nodeG.append("text")
      .text(d => d.id)
      .attr("text-anchor", "middle").attr("dy", "0.35em")
      .attr("fill", d => d.color)
      .attr("font-size", 11)
      .attr("font-family", "JetBrains Mono,monospace")
      .attr("font-weight", "600");

    // stop old sim
    if (simRef.current) simRef.current.stop();

    let tc = 0;

    const sim = d3.forceSimulation(nodes)
      .force("charge",    d3.forceManyBody().strength(chargeVal))
      .force("link",      d3.forceLink(links).id(d => d.id).distance(ldistVal).strength(0.8))
      .force("center",    d3.forceCenter(svgW / 2, H / 2).strength(0.05))
      .force("collision", d3.forceCollide(collVal))
      .alphaDecay(0.02);

    sim.on("tick", () => {
      tc++;
      setTickCount(tc);

      const a = sim.alpha();
      setAlpha(a);

      // clamp to bounds
      nodes.forEach(d => {
        d.x = Math.max(30, Math.min(svgW - 30, d.x));
        d.y = Math.max(30, Math.min(H - 30, d.y));
      });

      linkSel
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);

      nodeG.attr("transform", d => `translate(${d.x},${d.y})`);

      setNodeCount(nodes.length);
      setLinkCount(links.length);
    });

    // drag
    nodeG.call(
      d3.drag()
        .on("start", (e, d) => {
          if (!e.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => {
          if (!e.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

    simRef.current = sim;
    nodesRef.current = nodes;
    linksRef.current = links;
  }, []);

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // wait for d3 to load if needed
    const init = () => {
      const { nodes, links } = cloneData();
      buildSim(nodes, links, charge, linkDist, collision);
    };

    if (window.d3) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js";
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => { if (simRef.current) simRef.current.stop(); };
  }, []);

  // ── update forces without rebuilding ────────────────────────────────────────
  const applyForces = useCallback((c, ld, col) => {
    const d3 = window.d3;
    const sim = simRef.current;
    const links = linksRef.current;
    if (!sim || !d3 || !links) return;
    sim.force("charge",    d3.forceManyBody().strength(c));
    sim.force("link",      d3.forceLink(links).id(d => d.id).distance(ld).strength(0.8));
    sim.force("collision", d3.forceCollide(col));
    sim.alphaTarget(0.3).restart();
    setTimeout(() => sim?.alphaTarget(0), 1500);
  }, []);

  const handleCharge = (v) => { setCharge(v); applyForces(v, linkDist, collision); };
  const handleLinkDist = (v) => { setLinkDist(v); applyForces(charge, v, collision); };
  const handleCollision = (v) => { setCollision(v); applyForces(charge, linkDist, v); };

  const reheat = () => { simRef.current?.alpha(1).alphaTarget(0).restart(); };

  const addNode = () => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    if (!nodes || !links) return;
    const existing = nodes.map(n => n.id);
    const available = NODE_LABELS.filter(l => !existing.includes(l));
    if (!available.length) return;
    const label = available[Math.floor(Math.random() * available.length)];
    const color = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
    const source = nodes[Math.floor(Math.random() * nodes.length)].id;
    const svgW = svgRef.current?.getBoundingClientRect().width || W;
    nodes.push({ id: label, color, x: svgW / 2 + (Math.random() - .5) * 60, y: H / 2 + (Math.random() - .5) * 60 });
    links.push({ source, target: label });
    buildSim(nodes, links, charge, linkDist, collision);
  };

  const resetGraph = () => {
    const { nodes, links } = cloneData();
    buildSim(nodes, links, charge, linkDist, collision);
  };

  const isActive = alpha > 0.01;
  const alphaPercent = Math.round(alpha * 100);

  return (
    <div style={{
      background: C.bg, color: C.text, minHeight: "100vh",
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      padding: "28px 22px", boxSizing: "border-box",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { cursor: pointer; }
        *::-webkit-scrollbar { width: 5px; }
        *::-webkit-scrollbar-thumb { background: #2a2c4a; border-radius: 99px; }
        svg#fg { cursor: grab; }
        svg#fg:active { cursor: grabbing; }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.accent, marginBottom: 6 }}>
          🧲 D3 Force Graph
        </h1>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>
          // forceSimulation — вузли самі знаходять свої місця
        </p>

        {/* Demo card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: C.surface2, padding: "11px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>live simulation</span>
            <span style={{ fontSize: 11, color: isActive ? C.green : C.muted }}>
              {isActive ? "● active" : "○ cooled"}
            </span>
          </div>
          <div style={{ padding: 20 }}>

            {/* Alpha bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: C.muted, minWidth: 90 }}>// alpha (temp)</span>
              <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  background: C.green,
                  width: `${alphaPercent}%`,
                  transition: "width .1s",
                }} />
              </div>
              <span style={{ fontSize: 12, color: C.green, minWidth: 34 }}>{alpha.toFixed(2)}</span>
              <button
                onClick={reheat}
                style={{
                  background: "transparent", border: `1px solid ${C.green}44`,
                  borderRadius: 8, padding: "5px 12px",
                  fontSize: 12, fontFamily: "inherit", color: C.green,
                  cursor: "pointer",
                }}
              >
                reheat 🔥
              </button>
            </div>

            {/* Sliders */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center" }}>
              <SliderCtrl label="charge"     min={-500} max={-20} value={charge}    onChange={handleCharge}    />
              <SliderCtrl label="link dist"  min={30}   max={180} value={linkDist}  onChange={handleLinkDist}  />
              <SliderCtrl label="collision"  min={10}   max={60}  value={collision}  onChange={handleCollision} />

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={addNode} style={{
                  background: "transparent", border: `1px solid ${C.purple}44`,
                  borderRadius: 8, padding: "6px 14px", fontSize: 12,
                  fontFamily: "inherit", color: C.purple, cursor: "pointer",
                }}>
                  + вузол
                </button>
                <button onClick={resetGraph} style={{
                  background: "transparent", border: `1px solid ${C.red}44`,
                  borderRadius: 8, padding: "6px 14px", fontSize: 12,
                  fontFamily: "inherit", color: C.red, cursor: "pointer",
                }}>
                  reset
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <Stat value={nodeCount} label="// nodes" color={C.accent}  />
              <Stat value={linkCount} label="// links" color={C.purple}  />
              <Stat value={tickCount} label="// tick"  color={C.orange}  />
            </div>

            {/* SVG */}
            <svg
              id="fg"
              ref={svgRef}
              height={H}
              style={{ display: "block", width: "100%", borderRadius: 8, background: C.surface2 }}
            />
          </div>
        </div>

        {/* Force cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          <ForceCard
            name="forceManyBody" color={C.accent}
            desc="Відштовхування між усіма вузлами. strength < 0 = відштовхує, > 0 = притягує"
          />
          <ForceCard
            name="forceLink" color={C.purple}
            desc="Пружини між з'єднаними вузлами. distance задає бажану довжину ребра"
          />
          <ForceCard
            name="forceCenter" color={C.green}
            desc="Тягне всі вузли до центру. Не дає графу «втекти» за межі полотна"
          />
        </div>

        {/* Code card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: C.surface2, padding: "11px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.purple }}>// tick loop</span>
            <span style={{ fontSize: 11, color: C.muted }}>d3-force.js</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ background: C.surface2, borderRadius: 8, padding: "14px 18px", fontSize: 11.5, lineHeight: 1.85, borderLeft: `2px solid ${C.purple}`, fontFamily: "inherit" }}>
              <span style={{ color: C.purple }}>const</span>{" sim = d3."}
              <span style={{ color: C.accent }}>forceSimulation</span>{"(nodes)"}<br />
              {"  ."}
              <span style={{ color: C.accent }}>force</span>{"("}
              <span style={{ color: C.green }}>'charge'</span>{", d3."}
              <span style={{ color: C.accent }}>forceManyBody</span>{"()."}
              <span style={{ color: C.accent }}>strength</span>{"("}
              <span style={{ color: C.orange }}>-200</span>{"))"}<br />
              {"  ."}
              <span style={{ color: C.accent }}>force</span>{"("}
              <span style={{ color: C.green }}>'link'</span>{",.d3."}
              <span style={{ color: C.accent }}>forceLink</span>{"(links)."}
              <span style={{ color: C.accent }}>distance</span>{"("}
              <span style={{ color: C.orange }}>80</span>{"))"}<br />
              {"  ."}
              <span style={{ color: C.accent }}>force</span>{"("}
              <span style={{ color: C.green }}>'center'</span>{", d3."}
              <span style={{ color: C.accent }}>forceCenter</span>{"(W/"}
              <span style={{ color: C.orange }}>2</span>{", H/"}
              <span style={{ color: C.orange }}>2</span>{"));"}<br />
              <br />
              {"sim."}
              <span style={{ color: C.accent }}>on</span>{"("}
              <span style={{ color: C.green }}>'tick'</span>{", () => {"}<br />
              {"  "}
              <span style={{ color: C.muted, fontStyle: "italic" }}>// D3 оновив x,y — ми просто синхронізуємо SVG</span><br />
              {"  link."}
              <span style={{ color: C.accent }}>attr</span>{"("}
              <span style={{ color: C.green }}>'x1'</span>{", d => d.source.x)..."}<br />
              {"  node."}
              <span style={{ color: C.accent }}>attr</span>{"("}
              <span style={{ color: C.green }}>'transform'</span>{", d => "}
              <span style={{ color: C.green }}>{"`translate(${d.x},${d.y})`"}</span>
              {");"}<br />
              {"});"}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div style={{ background: C.surface2, border: `1px solid ${C.yellow}44`, borderRadius: 12, padding: "16px 20px", fontSize: 13, lineHeight: 1.9 }}>
          <span style={{ color: C.yellow, fontWeight: 700 }}>💡 alpha — температура симуляції:</span><br />
          <span style={{ color: C.accent }}>1.0</span>{" — гаряче, вузли активно рухаються  |  "}
          <span style={{ color: C.orange }}>0.3</span>{" — тепло, повільно  |  "}
          <span style={{ color: C.muted }}>0.0</span>{" — охолонуло, зупинилось"}<br />
          <span style={{ color: C.muted }}>
            Drag встановлює alphaTarget(0.3) — підігріває симуляцію поки тягнеш вузол 🎯
          </span>
        </div>

      </div>
    </div>
  );
}
