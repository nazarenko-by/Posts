// Treemap бандла (d3-hierarchy): маршрут → пакет → файл. Дані - bundle.json / bundle.after.json зі scripts/analyze.mjs.
import { hierarchy, treemap, treemapSquarify } from "d3-hierarchy";
import { select } from "d3-selection";
import before from "../bundle.json";
import after from "../bundle.after.json";

const DATA = { before, after };
const COLORS = {
    zod: "#f7768e", next: "#7aa2f7", "react-dom": "#bb9af7", react: "#9aa5ce", "cmdk + radix": "#1abc9c",
    "tailwind-merge": "#7dcfff", "мій код": "#9ece6a",
};
const color = (g) => COLORS[g] || "#e0af68";
const kb = (b) => `${(b / 1024).toFixed(1).replace(".", ",")} KB`;

// та сама логіка груп, що й у пості
function groupOf(f) {
    if (f.startsWith("[")) return { g: "next", leaf: f };
    const i = f.lastIndexOf("node_modules/");
    if (i < 0) return { g: "мій код", leaf: f };
    const r = f.slice(i + 13);
    if (f.includes("/compiled/react-dom") || f.includes("/compiled/scheduler")) return { g: "react-dom", leaf: r };
    if (f.includes("/compiled/react/")) return { g: "react", leaf: r };
    const p = r.split("/");
    const pkg = p[0].startsWith("@") ? `${p[0]}/${p[1]}` : p[0];
    if (pkg.startsWith("@radix-ui") || ["cmdk", "react-remove-scroll", "react-remove-scroll-bar", "aria-hidden", "use-sidecar",
        "react-style-singleton", "use-callback-ref", "get-nonce"].includes(pkg)) return { g: "cmdk + radix", leaf: r };
    if (["next", "@swc/helpers", "tslib"].includes(pkg)) return { g: "next", leaf: r };
    return { g: pkg, leaf: r };
}

function tree(d, route) {
    const chunks = [...new Set([...d.shared, ...d.routes[route]])];
    const groups = new Map();
    for (const c of chunks) for (const [f, size] of Object.entries(d.chunks[c].files)) {
        const { g, leaf } = groupOf(f);
        if (!groups.has(g)) groups.set(g, new Map());
        const m = groups.get(g);
        m.set(leaf, (m.get(leaf) || 0) + size);
    }
    return {
        name: route,
        bytes: chunks.reduce((s, c) => s + d.chunks[c].bytes, 0),
        gzip: chunks.reduce((s, c) => s + d.chunks[c].gzip, 0),
        children: [...groups].map(([g, m]) => ({ name: g, group: g, children: [...m].map(([f, v]) => ({ name: f, group: g, value: v })) })),
    };
}

const svg = select("#map"), tip = document.getElementById("tip");
let focus = null;

function render() {
    const d = DATA[document.getElementById("build").value];
    const route = document.getElementById("route").value;
    const t = tree(d, route);
    document.getElementById("total").textContent = `${kb(t.bytes)} · gzip ${kb(t.gzip)} · Next.js ${d.next}`;

    const W = Math.min(1200, document.body.clientWidth - 48), H = Math.round(W * 0.6);
    svg.attr("viewBox", `0 0 ${W} ${H}`).attr("width", W).attr("height", H);
    const root = hierarchy(focus ? t.children.find((c) => c.name === focus) || t : t).sum((n) => n.value || 0).sort((a, b) => b.value - a.value);
    treemap().tile(treemapSquarify).size([W, H]).paddingInner(2).paddingTop(focus ? 0 : 22).round(true)(root);
    document.getElementById("crumbs").innerHTML = focus ? `<button id="up">← ${route}</button> / <b>${focus}</b> · ${kb(root.value)}` : "";
    document.getElementById("up")?.addEventListener("click", () => { focus = null; render(); });

    svg.selectAll("*").remove();
    const nodes = focus ? root.leaves() : root.descendants().filter((n) => n.depth >= 1);
    const g = svg.selectAll("g").data(nodes).join("g").attr("transform", (n) => `translate(${n.x0},${n.y0})`);
    g.append("rect")
        .attr("width", (n) => Math.max(0, n.x1 - n.x0)).attr("height", (n) => Math.max(0, n.y1 - n.y0)).attr("rx", 4)
        .attr("fill", (n) => color(n.data.group)).attr("fill-opacity", (n) => (n.depth === 1 && !focus ? 0.18 : 0.35))
        .attr("stroke", (n) => color(n.data.group)).attr("stroke-opacity", (n) => (n.children ? 0.9 : 0.25))
        .style("cursor", (n) => (!focus && n.depth === 1 ? "pointer" : "default"))
        .on("click", (e, n) => { if (!focus) { focus = (n.depth === 1 ? n : n.parent).data.name; render(); } })
        .on("mousemove", (e, n) => {
            tip.hidden = false; tip.style.left = `${e.pageX + 12}px`; tip.style.top = `${e.pageY + 12}px`;
            tip.textContent = `${n.data.name} - ${kb(n.value)} (${((n.value / root.value) * 100).toFixed(1)}%)`;
        })
        .on("mouseleave", () => { tip.hidden = true; });
    g.filter((n) => (focus || n.depth === 1) && n.x1 - n.x0 > 60 && n.y1 - n.y0 > 18).append("text")
        .attr("x", 6).attr("y", 15).attr("class", "label")
        .text((n) => {
            // підпис обрізаємо під ширину плитки (моноширинний 12px ≈ 7.3px на символ)
            const s = `${focus ? n.data.name.split("/").pop() : n.data.name} · ${kb(n.value)}`;
            const max = Math.floor((n.x1 - n.x0 - 12) / 7.3);
            return s.length <= max ? s : max > 4 ? s.slice(0, max - 1) + "…" : "";
        });
}

const sel = document.getElementById("route");
sel.innerHTML = Object.keys(before.routes).sort().map((r) => `<option ${r === "/auth" ? "selected" : ""}>${r}</option>`).join("");
for (const id of ["route", "build"]) document.getElementById(id).addEventListener("change", () => { focus = null; render(); });
addEventListener("resize", render);
render();
