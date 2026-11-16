// for, for...of, forEach, reduce / map на 1 000 000 і 1 000 елементів - у Node і в Chromium.
//   node scripts/bench.mjs [runs=5]  →  results.json
// Кожен варіант - окремий процес Node / окрема сторінка Chromium, runs разів; беремо медіану.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require("/opt/npm-tools/node_modules/playwright"); }
const runs = Number(process.argv[2] || 5);
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const VARIANTS = { sum: ["for", "forOf", "forEach", "reduce"], totals: ["for", "forOf", "forEach", "map"] };
const SIZES = [1e6, 1e3];
const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// код для браузера: cases.js + measure.js без export
const src = (readFileSync(here("./cases.js"), "utf8") + readFileSync(here("./measure.js"), "utf8")).replace(/^export /gm, "");

const browser = await pw.chromium.launch();
const out = { date: new Date().toISOString().slice(0, 10), node: process.version, cpus: cpus().length, runs, results: {} };
for (const n of SIZES) for (const [task, names] of Object.entries(VARIANTS)) for (const name of names) {
    const node = [], chrome = [];
    for (let r = 0; r < runs; r++) {
        node.push(JSON.parse(execFileSync(process.execPath, [here("./one.mjs"), task, name, String(n)], { encoding: "utf8" })));
        const page = await browser.newPage();
        await page.addScriptTag({ content: src });
        chrome.push(await page.evaluate(([t, c, n]) => measure(CASES[t][c], makeData(n)), [task, name, n]));
        await page.close();
    }
    const pick = (xs) => ({ coldMs: +med(xs.map((x) => x.cold)).toFixed(3), hotMs: +med(xs.map((x) => x.hot)).toFixed(4) });
    const key = `${task}/${name}/${n}`;
    out.results[key] = { node: pick(node), chromium: pick(chrome) };
    console.log(key.padEnd(22), "node", JSON.stringify(out.results[key].node), "chromium", JSON.stringify(out.results[key].chromium));
}
out.chromium = browser.version();
await browser.close();
writeFileSync(here("../results.json"), JSON.stringify(out, null, 2));
