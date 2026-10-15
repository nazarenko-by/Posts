import * as d3 from "d3";
import { densityByName, LABELS } from "./data.js";
import { fetchAlerts, RAIONS } from "./alerts.js";

const COLORS = ["#2a3358", "#4b4f75", "#7a6650", "#a8854f", "#d1a15a", "#ffd17a"];
const BREAKS = [45, 60, 80, 100, 130];
const ALERT_COLORS = { full: "#ff5f57", part: "#ff9e64", none: "#232946" };
const POLL_MS = 30_000; // NEPTUN просить не частіше ніж раз на 5 с; 30 с - з запасом

export async function ukraineMap(container, tooltipEl, statusEl, { width = 900, height = 600 } = {}) {
  // 1. GeoJSON областей (лежить у public/)
  const geo = await d3.json("/ukraine-oblasts.geojson");

  // 2. Проєкція під розмір SVG і генератор контурів
  const projection = d3.geoMercator().fitSize([width, height], geo);
  const path = d3.geoPath(projection);

  // 3. Колір щільності: 6 класів за порогами
  const color = d3.scaleThreshold().domain(BREAKS).range(COLORS);
  const nameOf = (f) => f.properties.name_uk;
  const density = (f) => densityByName.get(nameOf(f)) ?? null;

  const svg = d3.select(container).append("svg")
    .attr("viewBox", [0, 0, width, height + 70])
    .attr("width", width)
    .attr("height", height + 70);

  // штрихування для «немає даних»
  svg.append("defs").append("pattern")
    .attr("id", "hatch").attr("width", 8).attr("height", 8)
    .attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)")
    .call((p) => {
      p.append("rect").attr("width", 8).attr("height", 8).attr("fill", "#1f2335");
      p.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 8)
        .attr("stroke", "#565f89").attr("stroke-width", 3);
    });

  // 4. Області
  const regions = svg.append("g")
    .selectAll("path")
    .data(geo.features)
    .join("path")
    .attr("class", "region")
    .attr("d", path)
    .attr("fill-rule", "evenodd");

  // 5. Легенди (дві - для кожного режиму)
  const legend = svg.append("g").attr("transform", `translate(10, ${height + 24})`);
  const densityLegend = legend.append("g");
  densityLegend.append("text").attr("class", "label").attr("y", 14).text("людей/км²");
  const labels = ["<45", "45", "60", "80", "100", "130+"];
  const item = densityLegend.selectAll("g.item").data(COLORS).join("g")
    .attr("class", "item")
    .attr("transform", (_, i) => `translate(${100 + i * 70},0)`);
  item.append("rect").attr("width", 64).attr("height", 14).attr("rx", 3).attr("fill", (c) => c);
  item.append("text").attr("class", "label").attr("y", 34).text((_, i) => labels[i]);
  const nd = densityLegend.append("g").attr("transform", `translate(${100 + 6 * 70 + 20},0)`);
  nd.append("rect").attr("width", 30).attr("height", 14).attr("rx", 3).attr("fill", "url(#hatch)");
  nd.append("text").attr("class", "label").attr("x", 38).attr("y", 12).text("немає даних");

  const alertLegend = legend.append("g").attr("display", "none");
  [["full", "уся область"], ["part", "частина районів"], ["none", "без тривоги"]].forEach(([k, label], i) => {
    const g = alertLegend.append("g").attr("transform", `translate(${i * 170},0)`);
    g.append("rect").attr("width", 24).attr("height", 14).attr("rx", 3).attr("fill", ALERT_COLORS[k])
      .attr("stroke", k === "none" ? "#565f89" : null);
    g.append("text").attr("class", "label").attr("x", 32).attr("y", 12).text(label);
  });

  // 6. Режими
  let mode = "density";
  let alerts = null;
  let timer = null;

  function paint() {
    densityLegend.attr("display", mode === "density" ? null : "none");
    alertLegend.attr("display", mode === "alerts" ? null : "none");
    regions.classed("pulse", (f) => mode === "alerts" && alerts?.status(nameOf(f)) === "full")
      .transition().duration(500)
      .attr("fill", (f) => {
        if (mode === "alerts" && alerts) return ALERT_COLORS[alerts.status(nameOf(f))];
        const v = density(f);
        return v == null ? "url(#hatch)" : color(v);
      });
  }

  async function refreshAlerts() {
    try {
      alerts = await fetchAlerts();
      statusEl.textContent = `Тривоги: оновлено ${alerts.updatedAt.toLocaleTimeString("uk-UA")} · не офіційне джерело`;
    } catch (e) {
      statusEl.textContent = `Не вдалося отримати тривоги (${e.message}) - показуємо щільність`;
      mode = "density";
    }
    paint();
  }

  function setMode(next) {
    mode = next;
    clearInterval(timer);
    if (mode === "alerts") {
      refreshAlerts();
      timer = setInterval(refreshAlerts, POLL_MS);
    } else {
      statusEl.textContent = "";
      paint();
    }
  }

  // 7. Тултіп
  regions
    .on("pointermove", (event, f) => {
      const name = nameOf(f);
      const label = LABELS[name] ?? name;
      let line;
      if (mode === "alerts" && alerts) {
        const st = alerts.status(name);
        const since = alerts.since(name);
        line = st === "full"
          ? `тривога${since ? ` з ${new Date(since).toLocaleString("uk-UA")}` : ""}`
          : st === "part" ? `тривога в ${alerts.count(name)} з ${RAIONS[name]} районів` : "без тривоги";
      } else {
        const v = density(f);
        line = v == null ? "немає даних" : `${v} людей/км²`;
      }
      tooltipEl.hidden = false;
      tooltipEl.innerHTML = `<b>${label}</b><br>${line}`;
      tooltipEl.style.left = `${event.clientX + 14}px`;
      tooltipEl.style.top = `${event.clientY + 14}px`;
    })
    .on("pointerleave", () => {
      tooltipEl.hidden = true;
    });

  paint();
  return { setMode };
}
