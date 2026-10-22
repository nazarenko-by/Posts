import * as d3 from "d3";
import { PACKAGES, ROWS } from "./data.js";
import "./style.css";

const W = 960, H = 440;
const M = { top: 24, right: 130, bottom: 44, left: 150 };
const byKey = Object.fromEntries(PACKAGES.map((p) => [p.key, p]));

// 1. місце в кожному кварталі: сортуємо за завантаженнями
const rows = ROWS.map((d) => ({ ...d }));
const byQ = d3.group(rows, (d) => d.q);
for (const [, list] of byQ)
  d3.sort(list, (d) => -d.n).forEach((d, i) => (d.rank = i + 1));

const qs = [...byQ.keys()].sort();
const ranks = d3.range(1, PACKAGES.length + 1);

// 2. шкали: колонки - квартали, рядки - місця
const x = d3.scalePoint(qs, [M.left, W - M.right]);
const y = d3.scalePoint().domain(ranks).range([M.top, H - M.bottom]);

// 3. лінія з горизонтальними дотичними
const line = d3.line()
  .x((d) => x(d.q)).y((d) => y(d.rank))
  .curve(d3.curveBumpX);

const svg = d3.select("#chart").attr("viewBox", `0 0 ${W} ${H}`);
const tip = d3.select("#tip");

// сітка: перший квартал кожного року
const grid = svg.append("g").attr("class", "grid");
grid.selectAll("line")
  .data(qs.filter((q) => q.endsWith("Q1")))
  .join("line")
  .attr("x1", x).attr("x2", x)
  .attr("y1", M.top - 14).attr("y2", H - M.bottom + 14);
grid.selectAll("text")
  .data(qs.filter((q) => q.endsWith("Q1")))
  .join("text")
  .attr("x", (q) => x(q) + 6).attr("y", H - 12)
  .text((q) => q.slice(0, 4));

svg.append("g").selectAll("text")
  .data(ranks)
  .join("text")
  .attr("class", "rank")
  .attr("x", 12).attr("y", (r) => y(r) + 5)
  .text((r) => `#${r}`);

const series = d3.groups(rows, (d) => d.key)
  .map(([key, values]) => ({ key, values: d3.sort(values, (d) => d.q) }));

const paths = svg.append("g").selectAll("g")
  .data(series)
  .join("g")
  .attr("class", "series");

paths.append("path").attr("class", "halo").attr("d", (s) => line(s.values));
paths.append("path").attr("stroke", (s) => byKey[s.key].color).attr("d", (s) => line(s.values));
paths.selectAll("circle")
  .data((s) => s.values)
  .join("circle")
  .attr("r", 5)
  .attr("cx", (d) => x(d.q)).attr("cy", (d) => y(d.rank))
  .attr("fill", (d) => byKey[d.key].color);

// назви: зліва - стартове місце, справа - поточне
paths.append("text")
  .attr("class", "name")
  .attr("text-anchor", "end")
  .attr("x", M.left - 14)
  .attr("y", (s) => y(s.values[0].rank) + 5)
  .attr("fill", (s) => byKey[s.key].color)
  .text((s) => byKey[s.key].name);
paths.append("text")
  .attr("class", "name")
  .attr("x", W - M.right + 14)
  .attr("y", (s) => y(s.values.at(-1).rank) + 5)
  .attr("fill", (s) => byKey[s.key].color)
  .text((s) => byKey[s.key].name);

// 4. фокус: решта ліній тьмяніє
paths.on("pointerenter", (e, s) =>
  paths.classed("dim", (p) => p !== s))
.on("pointerleave", () => {
  paths.classed("dim", false);
  tip.attr("hidden", true);
});

// тултип над точкою: квартал, місце і справжні числа
paths.selectAll("circle").on("pointerenter", (e, d) => {
  const box = svg.node().getBoundingClientRect();
  const k = box.width / W;
  tip.attr("hidden", null)
    .style("left", `${x(d.q) * k + 12}px`)
    .style("top", `${y(d.rank) * k + 12}px`)
    .html(`<b>${byKey[d.key].name}</b> <span>${d.q}</span><br>#${d.rank} · ${d.n.toFixed(1)} млн/тиж`);
});
