// Реальні заміри в Chromium (Playwright): який розмір шрифту бачить користувач.
//   node scripts/measure.mjs
// Сценарії:
//   телефон 375 / десктоп 1440                    - звичайні налаштування
//   «Розмір шрифту: дуже великий» у Chrome        - standard font size 24px (CDP Page.setFontSizes)
//   зум 200% у вікні 1440                         - так працює Ctrl +: CSS-viewport 720px, devicePixelRatio 2
// «Бачить» = computed font-size (CSS px) × devicePixelRatio, тобто в пікселях екрана відносно 100%.
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const html = readFileSync(fileURLToPath(new URL("../public/sample.html", import.meta.url)), "utf8");

const SCENARIOS = [
    { key: "phone", label: "телефон 375px", width: 375, zoom: 1, base: 16 },
    { key: "tablet", label: "планшет 768px", width: 768, zoom: 1, base: 16 },
    { key: "desktop", label: "десктоп 1440px", width: 1440, zoom: 1, base: 16 },
    { key: "bigfont", label: "1440px, шрифт браузера «дуже великий» (24px)", width: 1440, zoom: 1, base: 24 },
    { key: "zoom200", label: "1440px, зум 200%", width: 1440, zoom: 2, base: 16 },
    { key: "zoom300", label: "1440px, зум 300%", width: 1440, zoom: 3, base: 16 },
    { key: "zoom400", label: "1440px, зум 400%", width: 1440, zoom: 4, base: 16 },
];
const IDS = ["px", "rem", "fluid", "fluid2", "vw"];

const browser = await chromium.launch();
const out = { date: new Date().toISOString().slice(0, 10), chromium: browser.version(), results: [] };

for (const s of SCENARIOS) {
    const ctx = await browser.newContext({
        viewport: { width: Math.round(s.width / s.zoom), height: 900 },
        deviceScaleFactor: s.zoom,
    });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Page.enable");
    await cdp.send("Page.setFontSizes", { fontSizes: { standard: s.base, fixed: Math.round(s.base * 13 / 16) } });
    await page.setContent(html);
    const r = await page.evaluate((ids) => ({
        vw: innerWidth, dpr: devicePixelRatio,
        rootPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
        sizes: Object.fromEntries(ids.map((id) => [id, parseFloat(getComputedStyle(document.getElementById(id)).fontSize)])),
    }), IDS);
    const seen = Object.fromEntries(IDS.map((id) => [id, +(r.sizes[id] * r.dpr).toFixed(1)]));
    out.results.push({ ...s, cssViewport: r.vw, rootPx: r.rootPx, css: r.sizes, seen });
    await ctx.close();
}
await browser.close();

const d = out.results.find((x) => x.key === "desktop").seen;
console.log(`Chromium ${out.chromium}, ${out.date}\n`);
console.log("сценарій".padEnd(46), IDS.map((i) => i.padStart(8)).join(""));
for (const x of out.results) {
    console.log(x.label.padEnd(46), IDS.map((i) => String(x.seen[i]).padStart(8)).join(""),
        x.key !== "desktop" && x.width === 1440 ? "   ×" + IDS.map((i) => (x.seen[i] / d[i]).toFixed(2)).join(" / ×") : "");
}
writeFileSync(fileURLToPath(new URL("../results.json", import.meta.url)), JSON.stringify(out, null, 2));
