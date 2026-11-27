// structuredClone, JSON.parse(JSON.stringify()) і lodash cloneDeep на п'яти формах даних NBY Shop - у Chromium і Node.
//   node scripts/bench.mjs [runs=5]  →  results.json
// Кожна пара «спосіб × дані» - окрема сторінка Chromium / окремий процес Node, runs разів, медіана.
// ok: false - клон неправильний (Date став рядком, Map - {}, ...), error - спосіб упав (цикл у JSON).
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require("/opt/npm-tools/node_modules/playwright"); }

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const runs = Number(process.argv[2] || 5);
const METHODS = ["structuredClone", "json", "cloneDeep"];
const CASES = ["product", "cart", "catalog", "rich", "cycle"];

const bundle = (await build({ entryPoints: [here("../src/measure.js")], bundle: true, format: "iife", globalName: "Bench",
    platform: "browser", write: false, minify: true })).outputFiles[0].text;
const browser = await pw.chromium.launch();
const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const out = { date: new Date().toISOString().slice(0, 10), node: process.version, chromium: browser.version(), cpus: cpus().length,
    lodash: require("lodash-es/package.json").version, runs, chromiumResults: {}, nodeResults: {} };

for (const c of CASES) for (const m of METHODS) {
    const ch = [], nd = [];
    for (let r = 0; r < runs; r++) {
        const page = await browser.newPage();
        await page.addScriptTag({ content: bundle });
        ch.push(await page.evaluate(([m, c]) => Bench.measure(m, c), [m, c]));
        await page.close();
        nd.push(JSON.parse(execFileSync(process.execPath, [here("../src/node-one.mjs"), m, c], { encoding: "utf8" })));
    }
    const pick = (xs) => xs[0].error ? { ok: false, error: xs[0].error } : { ok: xs[0].ok, us: med(xs.map((x) => x.us)) };
    (out.chromiumResults[c] ??= {})[m] = pick(ch);
    (out.nodeResults[c] ??= {})[m] = pick(nd);
    console.log(c.padEnd(8), m.padEnd(16), "chromium", JSON.stringify(out.chromiumResults[c][m]), "node", JSON.stringify(out.nodeResults[c][m]));
}
await browser.close();
writeFileSync(here("../results.json"), JSON.stringify(out, null, 2));
