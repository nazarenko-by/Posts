import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";

const COLORS = {
  Google: "#7dcfff", Instagram: "#bb9af7", Direct: "#9ece6a",
  Головна: "#ff9e64", Блог: "#1abc9c", Ціни: "#e0af68",
  Реєстрація: "#9ece6a", Пішли: "#565f89",
};
const fmt = d3.format(",").bind(null);
const num = (v) => fmt(v).replace(/,/g, " ");

export function sankeyChart(container, data, { width = 960, height = 560 } = {}) {
  const margin = { top: 10, right: 150, bottom: 10, left: 130 };

  // 1. Розмітка: d3-sankey рахує x0/x1/y0/y1 вузлів і width/y0/y1 потоків.
  //    structuredClone - бо sankey() мутує вхідні об'єкти.
  const { nodes, links } = d3Sankey()
    .nodeId((d) => d.name)
    .nodeWidth(18)
    .nodePadding(28)
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])(structuredClone(data));

  const svg = d3.select(container).append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  // 2. Градієнт для кожного потоку: колір джерела → колір цілі
  const defs = svg.append("defs");
  links.forEach((l, i) => {
    const g = defs.append("linearGradient")
      .attr("id", `grad-${i}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", l.source.x1)
      .attr("x2", l.target.x0);
    g.append("stop").attr("offset", "0%").attr("stop-color", COLORS[l.source.name]);
    g.append("stop").attr("offset", "100%").attr("stop-color", COLORS[l.target.name]);
  });

  // 3. Потоки: крива Безьє + stroke-width = d.width
  const link = svg.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("class", "link")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", (d, i) => `url(#grad-${i})`)
    .attr("stroke-width", (d) => Math.max(1, d.width));
  link.append("title").text((d) => `${d.source.name} → ${d.target.name}\n${num(d.value)}`);

  // 4. Вузли
  const node = svg.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "node");

  node.append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("rx", 4)
    .attr("fill", (d) => COLORS[d.name]);

  // 5. Підписи: перша колонка - зліва, решта - справа від вузла
  const label = node.append("text")
    .attr("x", (d) => (d.depth === 0 ? d.x0 - 10 : d.x1 + 10))
    .attr("y", (d) => (d.y0 + d.y1) / 2)
    .attr("text-anchor", (d) => (d.depth === 0 ? "end" : "start"));
  label.append("tspan").attr("class", "name").text((d) => d.name);
  label.append("tspan").attr("class", "value")
    .attr("x", (d) => (d.depth === 0 ? d.x0 - 10 : d.x1 + 10))
    .attr("dy", "1.3em")
    .text((d) => num(d.value));
  const insight = label.append("tspan").attr("class", "insight")
    .attr("x", (d) => (d.depth === 0 ? d.x0 - 10 : d.x1 + 10))
    .attr("dy", "1.4em");

  // 6. Hover: підсвітити потоки вузла + показати найбільший вихідний потік у %
  node.on("pointerenter", (e, n) => {
    link.classed("dim", (l) => l.source !== n && l.target !== n);
    node.classed("dim", (m) => m !== n && !links.some((l) => (l.source === n && l.target === m) || (l.target === n && l.source === m)));
    const top = d3.greatest(n.sourceLinks, (l) => l.value);
    insight.text((m) => (m === n && top ? `${Math.round((top.value / n.value) * 100)}% → ${top.target.name}` : ""));
  });
  node.on("pointerleave", () => {
    link.classed("dim", false);
    node.classed("dim", false);
    insight.text("");
  });

  return svg.node();
}
