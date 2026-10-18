import * as d3 from "d3";

const RED = "#ff5f57", YELLOW = "#e0af68", GREEN = "#9ece6a";
const W = 480, H = 350, R1 = 170, R0 = 124;

// Gauge: значення 0–100 → кут від -90° до +90° (0 - «12 година», як у d3.arc)
export function createGauge(container, { target = 80 } = {}) {
  const angle = d3.scaleLinear().domain([0, 100]).range([-Math.PI / 2, Math.PI / 2]).clamp(true);
  const arc = d3.arc().innerRadius(R0).outerRadius(R1).startAngle(-Math.PI / 2).cornerRadius(4);
  const zone = (v) => (v < 50 ? RED : v < target ? YELLOW : GREEN);

  const svg = d3.select(container).append("svg").attr("viewBox", [-W / 2, -R1 - 50, W, H]);

  // підкладка + зони
  svg.append("path").attr("fill", "#232946").attr("d", arc.endAngle(Math.PI / 2)());
  const band = d3.arc().innerRadius(R1 + 8).outerRadius(R1 + 13);
  [[0, 50, RED], [50, target, YELLOW], [target, 100, GREEN]].forEach(([a, b, c]) =>
    svg.append("path").attr("fill", c).attr("opacity", 0.6)
      .attr("d", band.startAngle(angle(a)).endAngle(angle(b))()));

  // поділки
  svg.append("g").selectAll("text").data([0, 25, 50, 75, 100]).join("text")
    .attr("class", "tick")
    .attr("x", (d) => Math.sin(angle(d)) * (R1 + 34))
    .attr("y", (d) => -Math.cos(angle(d)) * (R1 + 34) + 6)
    .text((d) => d);

  // мітка цілі
  svg.append("line").attr("class", "target")
    .attr("x1", Math.sin(angle(target)) * (R0 - 6)).attr("y1", -Math.cos(angle(target)) * (R0 - 6))
    .attr("x2", Math.sin(angle(target)) * (R1 + 16)).attr("y2", -Math.cos(angle(target)) * (R1 + 16));

  const value = svg.append("path").attr("d", arc.endAngle(angle(0))());
  const needle = svg.append("line").attr("class", "needle").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", -(R1 - 10));
  svg.append("circle").attr("r", 14).attr("class", "hub");
  const label = svg.append("text").attr("class", "value").attr("y", 72).text("0%");
  svg.append("text").attr("class", "caption").attr("y", 104).text(`виконання плану · ціль ${target}%`);

  return function update(v) {
    // старе значення зберігаємо на DOM-вузлі - кожна анімація стартує звідти, де зупинилась попередня
    const from = value.node()._v ?? 0;
    value.node()._v = v;
    const i = d3.interpolate(from, v);
    const t = d3.transition().duration(800).ease(d3.easeCubicInOut);

    value.transition(t)
      .attrTween("d", () => (k) => arc.endAngle(angle(i(k)))())
      .attrTween("fill", () => (k) => zone(i(k)));
    needle.transition(t)
      .attrTween("transform", () => (k) => `rotate(${(angle(i(k)) * 180) / Math.PI})`);
    label.transition(t)
      .textTween(() => (k) => `${Math.round(i(k))}%`)
      .styleTween("fill", () => (k) => zone(i(k))); // style, а не attr: CSS-правило .value { fill } перебило б атрибут
  };
}
