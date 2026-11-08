// Заміри 4 збірок у headless Chromium (Playwright), CPU уповільнено ×4 (як середній телефон).
//   node scripts/bench.mjs [runs=3]  →  results.json
// Сценарії (лічильники скидаються перед кожним):
//   note  - 20 символів у поле «нотатка» (стан, від якого список НЕ залежить)
//   query - «react» у поле пошуку (список МУСИТЬ перерахуватись)
//   add   - 10 кліків «у кошик» (теж не стосується списку)
// Метрики: рендери карток і списку (onRender у <Profiler>), час React (сума actualDuration комітів),
//          JS-бандл (байти і gzip). Медіана з runs запусків на кожен варіант.
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const runs = Number(process.argv[2] || 3);
const VARIANTS = ["plain", "manual", "plain+compiler", "manual+compiler"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

function serve(dir) {
    return new Promise((res) => {
        const srv = createServer((req, rsp) => {
            const p = join(dir, req.url === "/" ? "index.html" : req.url.split("?")[0]);
            if (!existsSync(p)) { rsp.writeHead(404); return rsp.end(); }
            rsp.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
            rsp.end(readFileSync(p));
        }).listen(0, () => res(srv));
    });
}

const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const browser = await chromium.launch();
const out = { date: new Date().toISOString().slice(0, 10), chromium: browser.version(), cpuThrottle: 4, runs, variants: {} };

for (const v of VARIANTS) {
    const dir = join(root, "dist", v);
    const js = readdirSync(join(dir, "assets")).filter((f) => f.endsWith(".js")).map((f) => readFileSync(join(dir, "assets", f)));
    const bundle = { bytes: js.reduce((s, b) => s + b.length, 0), gzip: js.reduce((s, b) => s + gzipSync(b, { level: 9 }).length, 0) };
    const srv = await serve(dir);
    const url = `http://localhost:${srv.address().port}/`;
    const samples = { note: [], query: [], add: [] };

    for (let r = 0; r < runs; r++) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await page.goto(url);
        await page.waitForSelector(".card");
        const idle = () => page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => setTimeout(ok, 0))));
        const take = () => page.evaluate(() => ({ ...window.__stats }));

        await page.evaluate(() => window.__reset());
        await page.click("#note");
        for (const ch of "доставка до 18:00 пн") { await page.keyboard.type(ch); await idle(); }
        samples.note.push(await take());

        await page.evaluate(() => window.__reset());
        await page.click("#query");
        for (const ch of "react") { await page.keyboard.type(ch); await idle(); }
        samples.query.push(await take());

        await page.evaluate(() => window.__reset());
        const buttons = await page.$$(".card button");
        for (const b of buttons.slice(0, 10)) { await b.click(); await idle(); }
        samples.add.push(await take());
        await page.close();
    }
    srv.close();
    const pick = (arr) => ({
        commits: med(arr.map((s) => s.commits)),
        cards: med(arr.map((s) => s.cards)),
        lists: med(arr.map((s) => s.lists)),
        ms: +med(arr.map((s) => s.actual)).toFixed(1),
        msAll: arr.map((s) => +s.actual.toFixed(1)),
    });
    out.variants[v] = { bundle, note: pick(samples.note), query: pick(samples.query), add: pick(samples.add) };
    console.log(v.padEnd(16), JSON.stringify(out.variants[v]));
}
await browser.close();
writeFileSync(join(root, "results.json"), JSON.stringify(out, null, 2));

console.log(`\nChromium ${out.chromium}, CPU ×4, медіана з ${runs}\n`);
console.log("варіант".padEnd(18), "нотатка: картки / ms".padStart(22), "пошук: ms".padStart(11), "кошик: картки / ms".padStart(20), "JS gzip".padStart(9));
for (const [v, d] of Object.entries(out.variants)) {
    console.log(v.padEnd(18), `${d.note.cards} / ${d.note.ms}`.padStart(22), `${d.query.ms}`.padStart(11),
        `${d.add.cards} / ${d.add.ms}`.padStart(20), `${(d.bundle.gzip / 1024).toFixed(1)} KB`.padStart(9));
}
