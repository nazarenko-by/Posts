// Швидкість запису 10 000 ключів: localStorage, IndexedDB (транзакція на ключ / одна транзакція), cookies.
//   node scripts/bench.mjs [n=10000] [runs=3]  →  results.json
// Кожен запуск - новий браузер із чистим профілем на диску (не інкогніто: там IndexedDB живе в пам'яті).
// Сторінка віддається з http://localhost, бо cookies не працюють на file://.
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir, cpus } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require("/opt/npm-tools/node_modules/playwright"); }
const n = Number(process.argv[2] || 10000);
const runs = Number(process.argv[3] || 3);

const html = readFileSync(fileURLToPath(new URL("../public/index.html", import.meta.url)));
const server = createServer((_, res) => { res.setHeader("content-type", "text/html; charset=utf-8"); res.end(html); });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://localhost:${server.address().port}/`;

const all = [];
for (let r = 0; r < runs; r++) {
    const dir = mkdtempSync(join(tmpdir(), "storage-"));
    const ctx = await pw.chromium.launchPersistentContext(dir, { headless: true });
    const page = ctx.pages()[0] || (await ctx.newPage());
    await page.goto(url);
    const res = await page.evaluate((n) => runAll(n), n);
    all.push(res);
    console.log(`run ${r + 1}:`, Object.entries(res).filter(([k]) => k !== "ua")
        .map(([k, v]) => `${k} ${v.writeMs.toFixed(0)}ms (${v.stored})`).join(" · "));
    await ctx.close();
    rmSync(dir, { recursive: true, force: true });
}
server.close();

const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const keys = ["localStorage", "idbEach", "idbBatch", "cookies"];
const out = {
    date: new Date().toISOString().slice(0, 10), n, runs, cpus: cpus().length, ua: all[0].ua, cases: {},
};
for (const k of keys) {
    const f = (m) => +med(all.map((a) => a[k][m])).toFixed(1);
    out.cases[k] = { writeMs: f("writeMs"), syncMs: f("syncMs"), readMs: f("readMs"), stored: all[0][k].stored, ...(k === "cookies" ? { firstReadMs: f("firstReadMs") } : {}),
        allWrite: all.map((a) => +a[k].writeMs.toFixed(1)) };
}
console.table(out.cases);
writeFileSync(fileURLToPath(new URL("../results.json", import.meta.url)), JSON.stringify(out, null, 2));
