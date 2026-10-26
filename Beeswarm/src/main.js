import * as d3 from "d3";
import { LIBS } from "./data.js";
import "./style.css";

const W = 960, H = 400;
const M = { top: 20, right: 70, bottom: 40, left: 30 };
const R = 9;

const CAT = {
  ui: { label: "UI", color: "#7aa2f7" },
  date: { label: "дати", color: "#e0af68" },
  valid: { label: "валідація", color: "#bb9af7" },
  http: { label: "HTTP", color: "#73daca" },
  state: { label: "стан", color: "#ff9e64" },
  util: { label: "утиліти", color: "#9ece6a" },
  viz: { label: "графіка", color: "#f7768e" },
};

// 1. лог-шкала: 0,35 KB і 185 KB на одній осі
const x = d3.scaleLog()
  .domain([0.25, 250]).range([M.left, W - M.right]);

// 2. сила тягне кожну точку до її x і до центру, collide не дає перекриватись
const nodes = LIBS.map((d) => ({ ...d }));
d3.forceSimulation(nodes)
  .force("x", d3.forceX((d) => x(d.kb)).strength(1))
  .force("y", d3.forceY((H - M.bottom + M.top) / 2).strength(0.02))
  .force("hit", d3.forceCollide(R + 16))
  .stop()
  .tick(300);

const svg = d3.select("#chart").attr("viewBox", `0 0 ${W} ${H}`);
const tip = d3.select("#tip");

svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${H - M.bottom})`)
  .call(d3.axisBottom(x).tickValues([0.5, 1, 2, 5, 10, 20, 50, 100, 200]).tickFormat((v) => `${v} KB`)
    .tickSize(-(H - M.top - M.bottom)).tickSizeOuter(0))
  .call((g) => g.selectAll(".tick line").attr("stroke-dasharray", "3 6"));

const dots = svg.append("g").selectAll("circle")
  .data(nodes)
  .join("circle")
  .attr("class", "dot")
  .attr("r", R)
  .attr("cx", (d) => d.x).attr("cy", (d) => d.y)
  .attr("fill", (d) => CAT[d.cat].color);

// підписи: праворуч, ліворуч, над або під точкою - де вільно; якщо ніде - лише в тултипі
const boxes = nodes.map((d) => ({ x0: d.x - R, x1: d.x + R, y0: d.y - R, y1: d.y + R }));
const hit = (b) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
for (const d of d3.sort(nodes, (d) => d.kb)) {
  const w = d.name.length * 7.6 + 4;
  // кандидати: праворуч, ліворуч, над точкою, під точкою
  const spots = [
    { anchor: "start", lx: d.x + R + 3, ly: d.y + 4, b: { x0: d.x + R + 3, x1: d.x + R + 3 + w, y0: d.y - 8, y1: d.y + 8 } },
    { anchor: "end", lx: d.x - R - 3, ly: d.y + 4, b: { x0: d.x - R - 3 - w, x1: d.x - R - 3, y0: d.y - 8, y1: d.y + 8 } },
    { anchor: "middle", lx: d.x, ly: d.y - R - 5, b: { x0: d.x - w / 2, x1: d.x + w / 2, y0: d.y - R - 19, y1: d.y - R - 3 } },
    { anchor: "middle", lx: d.x, ly: d.y + R + 15, b: { x0: d.x - w / 2, x1: d.x + w / 2, y0: d.y + R + 3, y1: d.y + R + 19 } },
  ];
  const spot = spots.find((sp) => sp.b.x0 > 4 && sp.b.x1 < W - 4 && !hit(sp.b));
  if (spot) { d.label = spot; boxes.push(spot.b); }
}

svg.append("g").selectAll("text")
  .data(nodes.filter((d) => d.label))
  .join("text")
  .attr("class", "label")
  .attr("x", (d) => d.label.lx)
  .attr("text-anchor", (d) => d.label.anchor)
  .attr("y", (d) => d.label.ly)
  .attr("fill", (d) => CAT[d.cat].color)
  .text((d) => d.name);

// легенда-фільтр: наведи на категорію - решта тьмяніє
d3.select("#legend").selectAll("span")
  .data(Object.entries(CAT))
  .join("span")
  .html(([, c]) => `<i style="background:${c.color}"></i>${c.label}`)
  .on("pointerenter", (e, [key]) => dots.classed("dim", (d) => d.cat !== key))
  .on("pointerleave", () => dots.classed("dim", false));

dots.on("pointerenter", (e, d) => {
  const k = svg.node().getBoundingClientRect().width / W;
  tip.attr("hidden", null)
    .style("left", `${d.x * k + 12}px`).style("top", `${d.y * k + 12}px`)
    .html(`<b>${d.name}</b> <span>${d.version}</span><br>${d.kb.toFixed(2)} KB min+gzip`);
}).on("pointerleave", () => tip.attr("hidden", true));
