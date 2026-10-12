import * as d3 from "d3";
import { generateDays } from "./data.js";
import { heatmapCalendar, longestStreak } from "./heatmap.js";

const days = generateDays();
heatmapCalendar(document.getElementById("chart"), days);

const total = d3.sum(days, (d) => d.count);
document.getElementById("summary").textContent =
  `${total} комітів за рік · найдовша серія: ${longestStreak(days)} дн.`;
