import * as d3 from "d3";

const COLORS = { готово: "#9ece6a", "в роботі": "#e0af68", черга: "#565f89" };
const R1 = 150, R0 = 98;

export function createDonut(container) {
  const pie = d3.pie().sort(null).value((d) => d.count).padAngle(0.025);
  const arc = d3.arc().innerRadius(R0).outerRadius(R1).cornerRadius(4);

  const svg = d3.select(container).append("svg").attr("viewBox", [-R1 - 10, -R1 - 10, (R1 + 10) * 2, (R1 + 10) * 2 + 110]);
  const slices = svg.append("g");
  const center = svg.append("text").attr("class", "value").attr("y", 10);
  svg.append("text").attr("class", "caption").attr("y", 44).text("задач готово");
  const legend = svg.append("g").attr("transform", `translate(${-R1 + 40},${R1 + 44})`);

  return function update(tasks) {
    const total = d3.sum(tasks, (d) => d.count);
    const arcs = pie(tasks);

    // плавний перехід сегментів: інтерполюємо startAngle/endAngle від попереднього стану (this._current)
    slices.selectAll("path")
      .data(arcs, (d) => d.data.label)
      .join((enter) => enter.append("path").attr("fill", (d) => COLORS[d.data.label])
        .each(function (d) { this._current = { ...d, endAngle: d.startAngle }; }))
      .transition().duration(800).ease(d3.easeCubicInOut)
      .attrTween("d", function (d) {
        const i = d3.interpolate(this._current, d);
        this._current = i(1);
        return (t) => arc(i(t));
      });

    const done = tasks.find((d) => d.label === "готово").count;
    center.transition().duration(800)
      .textTween(function () {
        const i = d3.interpolateRound(this._v ?? 0, done);
        this._v = done;
        return (t) => `${i(t)}/${total}`;
      });

    legend.selectAll("g").data(tasks, (d) => d.label).join((enter) => {
      const g = enter.append("g").attr("transform", (_, i) => `translate(0,${i * 28})`);
      g.append("circle").attr("r", 8).attr("cy", -6).attr("fill", (d) => COLORS[d.label]);
      g.append("text").attr("class", "n").attr("x", 20);
      g.append("text").attr("class", "lbl").attr("x", 56).text((d) => d.label);
      return g;
    }).select("text.n").text((d) => d.count);
  };
}
