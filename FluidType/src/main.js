// Демо FluidType: керуємо «вікном» iframe і показуємо, який розмір шрифту реально бачить користувач.
const $ = (id) => document.getElementById(id);
const IDS = [
    ["px", "40px"],
    ["rem", "2.5rem"],
    ["fluid", "clamp(1.75rem, 1rem + 3vw, 3rem)"],
    ["fluid2", "clamp(1.75rem, 1rem + 4.5vw, 3rem)"],
    ["vw", "clamp(28px, 4vw, 48px)"],
];
const iframe = $("sample");
const STAGE_H = 520;
let reference = null; // розміри при 1440 / 16px / 100%

function apply() {
    const w = +$("w").value, base = +$("base").value, zoom = +$("zoom").value;
    $("wOut").textContent = `${w}px`;
    const doc = iframe.contentDocument;
    if (!doc?.body) return;

    // зум браузера: CSS-viewport = ширина / зум, усе малюється в zoom разів більшим
    iframe.style.width = `${w / zoom}px`;
    iframe.style.height = `${STAGE_H / zoom}px`;
    iframe.style.transform = `scale(${zoom})`;
    $("frame").style.width = `${w}px`;
    // «Розмір шрифту» у налаштуваннях браузера = font-size кореня
    doc.documentElement.style.fontSize = `${base}px`;
    // нова ширина iframe стає його viewport лише на наступному кадрі - читаємо після двох rAF
    requestAnimationFrame(() => requestAnimationFrame(() => read(doc, zoom, base)));
}

function read(doc, zoom, base) {
    const css = Object.fromEntries(IDS.map(([id]) => [id, parseFloat(getComputedStyle(doc.getElementById(id)).fontSize)]));
    if (!reference) reference = css; // перший виклик - якраз 1440 / 16 / 100%

    $("readout").tBodies[0].innerHTML = IDS.map(([id, label]) => {
        const seen = css[id] * zoom;
        const k = seen / reference[id];
        const ok = Math.abs(k - Math.max(zoom, base / 16)) < 0.01 || (zoom === 1 && base === 16);
        return `<tr><td><code>${label}</code></td><td>${css[id].toFixed(1)}</td><td><b>${seen.toFixed(1)}px</b></td>
            <td class="${ok ? "ok" : "bad"}">×${k.toFixed(2)}</td></tr>`;
    }).join("");
}

iframe.addEventListener("load", () => { reference = null; $("w").value = 1440; $("base").value = 16; $("zoom").value = 1; apply(); });
for (const id of ["w", "base", "zoom"]) $(id).addEventListener("input", apply);
