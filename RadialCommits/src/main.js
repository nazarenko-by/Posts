import * as d3 from "d3";
import { GRID } from "./data.js";
import "./style.css";

const S = 600, R0 = 70, R1 = 260;
const DAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"];
const RW = (R1 - R0) / 7;
const TAU = Math.PI * 2;

// плоский список клітинок: день × година → кількість
const cells = GRID.flatMap((row, day) => row.map((count, hour) => ({ day, hour, count })));
const max = d3.max(cells, (d) => d.count);
const total = d3.sum(cells, (d) => d.count);

// sqrt-шкала: кілька комітів уже помітні, пік не «з'їдає» решту
const color = d3.scaleSqrt().domain([0, max]).range(["#3d4470", "#ffc777"]);

// d3.arc: кут 0 - угорі, за годинниковою стрілкою (як циферблат)
const arc = d3.arc()
  .innerRadius((d) => R0 + d.day * RW + 1)
  .outerRadius((d) => R0 + (d.day + 1) * RW - 1)
  .startAngle((d) => (d.hour / 24) * TAU + 0.005)
  .endAngle((d) => ((d.hour + 1) / 24) * TAU - 0.005);

const svg = d3.select("#chart").attr("viewBox", `${-S / 2} ${-S / 2} ${S} ${S}`);
const tip = d3.select("#tip");

svg.append("g").selectAll("path")
  .data(cells)
  .join("path")
  .attr("class", "cell")
  .attr("d", arc)
  .attr("fill", (d) => (d.count ? color(d.count) : "#1b2238"))
  .on("pointerenter", (e, d) => {
    const box = svg.node().getBoundingClientRect();
    const [cx, cy] = arc.centroid(d);
    const k = box.width / S;
    tip.attr("hidden", null)
      .style("left", `${(cx + S / 2) * k + 12}px`).style("top", `${(cy + S / 2) * k + 12}px`)
      .html(`${DAYS[d.day]}, ${String(d.hour).padStart(2, "0")}:00 - <b>${d.count}</b>`);
  })
  .on("pointerleave", () => tip.attr("hidden", true));

// години по колу
svg.append("g").selectAll("text")
  .data(d3.range(0, 24, 3))
  .join("text")
  .attr("class", "hour")
  .attr("x", (h) => Math.sin((h / 24) * TAU) * (R1 + 20))
  .attr("y", (h) => -Math.cos((h / 24) * TAU) * (R1 + 20) + 5)
  .text((h) => String(h).padStart(2, "0"));

// дні - вздовж сектора 05:00 (там зазвичай порожньо)
svg.append("g").selectAll("text")
  .data(DAYS)
  .join("text")
  .attr("class", "day")
  .attr("x", (_, i) => Math.sin((5.5 / 24) * TAU) * (R0 + (i + 0.5) * RW))
  .attr("y", (_, i) => -Math.cos((5.5 / 24) * TAU) * (R0 + (i + 0.5) * RW) + 4)
  .text((d) => d);

svg.append("text").attr("class", "center").attr("y", 6).text(`${total} комітів`);
d3.select("#total").text(`Пік: ${String(d3.maxIndex(d3.range(24), (h) => d3.sum(GRID, (r) => r[h]))).padStart(2, "0")}:00`);
