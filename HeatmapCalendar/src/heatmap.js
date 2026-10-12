import * as d3 from "d3";

const CELL = 14;
const STEP = 17; // клітинка + відступ
const LEVELS = ["#1f2335", "rgba(158,206,106,0.28)", "rgba(158,206,106,0.5)", "rgba(158,206,106,0.75)", "#9ece6a"];
const formatDate = d3.timeFormat("%d.%m.%Y");
const MONTHS = ["Січ", "Лют", "Бер", "Квіт", "Трав", "Черв", "Лип", "Серп", "Вер", "Жовт", "Лист", "Груд"];
const formatMonth = (m) => MONTHS[m.getMonth()]; // d3.timeFormat("%b") дав би англійські назви

export function heatmapCalendar(container, days) {
  const start = d3.timeMonday.floor(days[0].date);
  const weeks = d3.timeMonday.count(start, days.at(-1).date) + 1;
  const margin = { top: 24, left: 34 };
  const width = margin.left + weeks * STEP;
  const height = margin.top + 7 * STEP + 40;

  // 1. Позиція: колонка - тиждень від старту, рядок - день тижня (Пн = 0)
  const x = (d) => margin.left + d3.timeMonday.count(start, d.date) * STEP;
  const y = (d) => margin.top + ((d.date.getDay() + 6) % 7) * STEP;

  // 2. Колір: 5 рівнів за порогами (0, 1–3, 4–6, 7–9, 10+)
  const color = d3.scaleThreshold().domain([1, 4, 7, 10]).range(LEVELS);

  const svg = d3.select(container).append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  // 3. Клітинки
  svg.append("g")
    .selectAll("rect")
    .data(days)
    .join("rect")
    .attr("class", "cell")
    .attr("x", x)
    .attr("y", y)
    .attr("width", CELL)
    .attr("height", CELL)
    .attr("rx", 3)
    .attr("fill", (d) => color(d.count))
    .append("title")
    .text((d) => `${d.count} · ${formatDate(d.date)}`);

  // 4. Підписи місяців - над першим тижнем, що містить 1-ше число
  svg.append("g")
    .attr("class", "label")
    .selectAll("text")
    .data(d3.timeMonths(d3.timeMonth.ceil(start), days.at(-1).date))
    .join("text")
    .attr("x", (m) => margin.left + d3.timeMonday.count(start, m) * STEP)
    .attr("y", margin.top - 8)
    .text(formatMonth);

  // 5. Дні тижня
  svg.append("g")
    .attr("class", "label")
    .selectAll("text")
    .data([["Пн", 0], ["Ср", 2], ["Пт", 4]])
    .join("text")
    .attr("x", 0)
    .attr("y", ([, r]) => margin.top + r * STEP + CELL - 3)
    .text(([s]) => s);

  // 6. Легенда
  const legend = svg.append("g")
    .attr("transform", `translate(${width - LEVELS.length * STEP - 52},${height - 14})`);
  legend.append("text").attr("class", "label").attr("x", -6).attr("y", 0).attr("text-anchor", "end").text("менше");
  legend.selectAll("rect")
    .data(LEVELS)
    .join("rect")
    .attr("x", (_, i) => i * STEP)
    .attr("y", -11)
    .attr("width", CELL)
    .attr("height", CELL)
    .attr("rx", 3)
    .attr("fill", (c) => c);
  legend.append("text").attr("class", "label").attr("x", LEVELS.length * STEP + 2).attr("y", 0).text("більше");

  return svg.node();
}

// Найдовша серія днів поспіль з count > 0
export function longestStreak(days) {
  let best = 0;
  let current = 0;
  for (const d of days) {
    current = d.count > 0 ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}
