// Chord diagram імпортів між папками проєкту. Дані - src/data.json (npm run graph -- <шлях до проєкту>).
// Наведення на дугу підсвічує всі імпорти папки, на стрічку - пару «звідки → куди» з прикладами файлів.
import * as d3 from "d3";
import data from "./data.json";

const COLORS = ["#bb9af7", "#7aa2f7", "#e0af68", "#9ece6a", "#7dcfff", "#f7768e", "#ff9e64", "#73daca"];
const R = 250, r = R - 20;

const svg = d3.select("#chart");
const info = document.getElementById("info");
document.getElementById("meta").textContent =
    `${data.files} файлів · ${data.edges} імпортів · циклів: ${data.circular} · ${data.date}`;

const chords = d3.chordDirected().padAngle(0.04).sortSubgroups(d3.descending).sortChords(d3.descending)(data.matrix);
const color = (i) => COLORS[i % COLORS.length];

const ribbons = svg.append("g").selectAll("path").data(chords).join("path")
    .attr("class", "ribbon")
    .attr("d", d3.ribbonArrow().radius(r - 2).padAngle(1 / r))
    .attr("fill", (d) => color(d.source.index)).attr("fill-opacity", 0.75)
    .attr("stroke", "#0f1729");

const groups = svg.append("g").selectAll("g").data(chords.groups).join("g");
groups.append("path").attr("d", d3.arc().innerRadius(r).outerRadius(R)).attr("fill", (d) => color(d.index));
groups.append("text")
    .attr("class", "group-label")
    .each(function (d) {
        const a = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
        d3.select(this)
            .attr("x", Math.cos(a) * (R + 14)).attr("y", Math.sin(a) * (R + 14))
            .attr("dy", "0.35em")
            .attr("text-anchor", Math.cos(a) >= 0 ? "start" : "end");
    })
    .attr("fill", (d) => color(d.index))
    .text((d) => (d.endAngle - d.startAngle > 0.12 ? data.names[d.index] : ""));

const sum = (i, dir) => dir === "out" ? d3.sum(data.matrix[i]) : d3.sum(data.matrix, (row) => row[i]);

groups.on("mouseenter", (_, g) => {
    ribbons.attr("fill-opacity", (d) => (d.source.index === g.index || d.target.index === g.index ? 0.9 : 0.06));
    const n = data.names[g.index];
    info.innerHTML = `<b style="color:${color(g.index)}">${n}</b><br>імпортує: ${sum(g.index, "out")}<br>імпортують його: ${sum(g.index, "in")}`;
});
ribbons.on("mouseenter", (_, c) => {
    ribbons.attr("fill-opacity", (d) => (d === c ? 0.95 : 0.06));
    const from = data.names[c.source.index], to = data.names[c.target.index];
    const list = (data.examples[`${from}→${to}`] || []).map((x) => `<li>${x}</li>`).join("");
    info.innerHTML = `<b>${from} → ${to}</b>: ${data.matrix[c.source.index][c.target.index]}<ul>${list}</ul>`;
});
svg.on("mouseleave", () => { ribbons.attr("fill-opacity", 0.75); info.textContent = "Наведи на дугу або стрічку"; });
