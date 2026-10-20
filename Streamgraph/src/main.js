import * as d3 from "d3";
import { PACKAGES, MONTHS } from "./data.js";
import "./style.css";

const W = 960, H = 520;
const M = { top: 20, right: 120, bottom: 36, left: 20 };
const KEYS = PACKAGES.map((p) => p.key);
const byKey = Object.fromEntries(PACKAGES.map((p) => [p.key, p]));
const MON = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
const fmtMonth = (d) => `${MON[d.getMonth()]} ${d.getFullYear()}`;

const months = MONTHS.map((r) => ({ ...r, date: new Date(`${r.month}-01T00:00:00`) }));
const OFFSETS = {
  silhouette: d3.stackOffsetSilhouette,
  wiggle: d3.stackOffsetWiggle,
  expand: d3.stackOffsetExpand,
  none: d3.stackOffsetNone,
};

const svg = d3.select("#chart").attr("viewBox", `0 0 ${W} ${H}`);
const tip = d3.select("#tip");

const x = d3.scaleTime()
  .domain(d3.extent(months, (d) => d.date))
  .range([M.left, W - M.right]);
const y = d3.scaleLinear().range([H - M.bottom, M.top]);

const area = d3.area()
  .x((d) => x(d.data.date))
  .y0((d) => y(d[0])).y1((d) => y(d[1]))
  .curve(d3.curveCatmullRom);

svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${H - M.bottom})`)
  .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%Y")).tickSize(-(H - M.top - M.bottom)))
  .call((g) => g.select(".domain").remove());

const streams = svg.append("g");
const labels = svg.append("g");
const cursor = svg.append("line").attr("class", "cursor").attr("y1", M.top).attr("y2", H - M.bottom).attr("opacity", 0);
const dots = svg.append("g");

let series = [];
let offset = "silhouette";

function render(animate) {
  const stack = d3.stack()
    .keys(KEYS)
    .offset(OFFSETS[offset]);
  series = stack(months);
  y.domain(d3.extent(series.flat(2)));

  const t = svg.transition().duration(animate ? 750 : 0).ease(d3.easeCubicInOut);

  streams.selectAll("path")
    .data(series, (s) => s.key)
    .join("path")
    .attr("class", "stream")
    .attr("fill", (s) => byKey[s.key].color)
    .transition(t)
    .attr("d", area);

  // підписи справа: середина потоку в останньому місяці, з розсуванням
  const last = months.length - 1;
  const items = series
    .map((s) => ({ key: s.key, y: y((s[last][0] + s[last][1]) / 2), v: s[last].data[s.key] }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < items.length; i++) items[i].y = Math.max(items[i].y, items[i - 1].y + 34);

  labels.selectAll("g")
    .data(items, (d) => d.key)
    .join((enter) => {
      const g = enter.append("g").attr("class", "label");
      g.append("text").attr("class", "n");
      g.append("text").attr("class", "v").attr("dy", 15);
      return g;
    })
    .call((g) => g.select(".n").attr("fill", (d) => byKey[d.key].color).text((d) => byKey[d.key].name))
    .call((g) => g.select(".v").text((d) => `${d.v} млн`))
    .transition(t)
    .attr("transform", (d) => `translate(${W - M.right + 10},${d.y})`);
}

// курсор + тултип: найближчий місяць під мишею
const bisect = d3.bisector((d) => d.date).center;

svg.on("pointermove", (e) => {
  const [mx] = d3.pointer(e);
  const i = bisect(months, x.invert(mx));
  const d = months[i];
  const cx = x(d.date);
  cursor.attr("x1", cx).attr("x2", cx).attr("opacity", 1);

  dots.selectAll("circle")
    .data(series.filter((s) => s[i].data[s.key] > 0), (s) => s.key)
    .join("circle")
    .attr("r", 5)
    .attr("fill", "var(--text)")
    .attr("stroke", (s) => byKey[s.key].color)
    .attr("stroke-width", 2.5)
    .attr("cx", cx)
    .attr("cy", (s) => y((s[i][0] + s[i][1]) / 2));

  const total = d3.sum(KEYS, (k) => d[k]);
  tip.attr("hidden", null)
    .html(`<b>${fmtMonth(d.date)}</b>` + [...KEYS].reverse().map((k) =>
      `<div><i style="background:${byKey[k].color}"></i><span>${byKey[k].name}</span><code>${
        offset === "expand" ? `${Math.round((d[k] / total) * 100)}%` : d[k].toFixed(1)
      }</code></div>`).join(""));

  // тултип з того боку, де більше місця
  const box = svg.node().getBoundingClientRect();
  const px = (cx / W) * box.width;
  const left = px > box.width / 2 ? px - tip.node().offsetWidth - 4 : px + 28;
  tip.style("left", `${left}px`);
});

svg.on("pointerleave", () => {
  cursor.attr("opacity", 0);
  dots.selectAll("circle").remove();
  tip.attr("hidden", true);
});

d3.selectAll(".offsets button").on("click", function () {
  const btn = this;
  offset = btn.dataset.offset;
  d3.selectAll(".offsets button").attr("aria-pressed", function () { return String(this === btn); });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  render(!reduce);
});

render(false);
