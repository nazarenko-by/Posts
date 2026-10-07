import * as d3 from "d3";

const TAU = 2 * Math.PI;
const clamp = (v) => Math.max(0, Math.min(TAU, v));
const COLORS = ["#7dcfff", "#bb9af7", "#ff9e64", "#9ece6a", "#e0af68"];

// Zoomable sunburst: видно 2 кільця, глибші рівні відкриваються зумом.
export function sunburst(container, data, { size = 640 } = {}) {
  const r = size / 6; // одна одиниця глибини

  // 1. Ієрархія + розмітка: x — кут (0..2π), y — рівень (0..4)
  const h = d3.hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);
  const root = d3.partition().size([TAU, h.height + 1])(h);
  root.each((d) => (d.current = d));

  const color = d3.scaleOrdinal(root.children.map((d) => d.data.name), COLORS);
  const topColor = (d) => {
    while (d.depth > 1) d = d.parent;
    return color(d.data.name);
  };

  // 2. Генератор дуг
  const arc = d3.arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.006))
    .padRadius(r * 1.5)
    .innerRadius((d) => d.y0 * r)
    .outerRadius((d) => Math.max(d.y0 * r, d.y1 * r - 2));

  const visible = (d) => d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  const labelVisible = (d) => d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.06;
  const labelTransform = (d) => {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * r;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  };

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", [-size / 2, -size / 2, size, size])
    .attr("width", size)
    .attr("height", size);

  const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
    .attr("fill", (d) => topColor(d))
    .attr("fill-opacity", (d) => (visible(d) ? (d.children ? 0.9 : 0.6) : 0))
    .attr("pointer-events", (d) => (visible(d) ? "auto" : "none"))
    .attr("d", (d) => arc(d.current));

  path.filter((d) => d.children).style("cursor", "pointer").on("click", (e, p) => zoom(p));
  path.append("title").text((d) => `${d.ancestors().map((a) => a.data.name).reverse().join(" › ")}\n${d.value} KB`);

  const label = svg.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("class", "label")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", (d) => +labelVisible(d.current))
    .attr("transform", (d) => labelTransform(d.current))
    .text((d) => d.data.name);

  // 3. Центр: назад до батька
  const center = svg.append("g").style("cursor", "pointer").on("click", (e, p) => p && zoom(p));
  center.append("circle").attr("r", r - 6).attr("class", "center");
  const centerText = center.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").attr("class", "center-text");

  function setCenter(p) {
    center.datum(p.parent);
    centerText.text(p.parent ? `↩ ${p.data.name}` : `${p.data.name} · ${p.value} KB`);
  }
  setCenter(root);

  // 4. Зум: координати всіх вузлів відносно вибраного p
  function zoom(p) {
    setCenter(p);
    const k = TAU / (p.x1 - p.x0);
    root.each((d) => (d.target = {
      x0: clamp((d.x0 - p.x0) * k),
      x1: clamp((d.x1 - p.x0) * k),
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth),
    }));

    const t = svg.transition().duration(750);

    path.transition(t)
      .tween("data", (d) => {
        const i = d3.interpolate(d.current, d.target);
        return (time) => (d.current = i(time));
      })
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || visible(d.target);
      })
      .attr("fill-opacity", (d) => (visible(d.target) ? (d.children ? 0.9 : 0.6) : 0))
      .attr("pointer-events", (d) => (visible(d.target) ? "auto" : "none"))
      .attrTween("d", (d) => () => arc(d.current));

    label.filter(function (d) {
      return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    })
      .transition(t)
      .attr("fill-opacity", (d) => +labelVisible(d.target))
      .attrTween("transform", (d) => () => labelTransform(d.current));
  }

  return svg.node();
}
