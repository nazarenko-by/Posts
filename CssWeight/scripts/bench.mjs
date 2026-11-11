// Скільки CSS (і JS) їде в браузер: той самий інтерфейс у Tailwind v4, CSS Modules і vanilla-extract.
//   node scripts/bench.mjs [runs=3]  →  results.json
// Для кожного варіанту: vite build × runs (час - медіана), розміри dist/<варіант>/assets: CSS і JS - сирі, gzip -9, brotli -11.
// Перед замірами перевір, що три варіанти виглядають однаково: node scripts/screens.mjs (порівнює скріни попіксельно).
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const root = fileURLToPath(new URL("..", import.meta.url));
const runs = Number(process.argv[2] || 3);
const VARIANTS = ["tailwind", "modules", "vanilla", "tailwind-base"];
const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

function sizes(dir, ext) {
    const files = readdirSync(dir).filter((f) => f.endsWith(ext)).map((f) => readFileSync(join(dir, f)));
    const sum = (fn) => files.reduce((s, b) => s + fn(b), 0);
    return {
        raw: sum((b) => b.length),
        gzip: sum((b) => gzipSync(b, { level: 9 }).length),
        brotli: sum((b) => brotliCompressSync(b, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length),
    };
}

const out = { date: new Date().toISOString().slice(0, 10), node: process.version, runs, variants: {} };
for (const v of VARIANTS) {
    const times = [];
    for (let i = 0; i < runs; i++) {
        const t0 = performance.now();
        execSync("npx vite build --logLevel error", { cwd: root, env: { ...process.env, VARIANT: v }, stdio: "inherit" });
        times.push(Math.round(performance.now() - t0));
    }
    const assets = join(root, "dist", v, "assets");
    out.variants[v] = { buildMs: med(times), buildMsAll: times, css: sizes(assets, ".css"), js: sizes(assets, ".js") };
    console.log(v, JSON.stringify(out.variants[v]));
}
writeFileSync(join(root, "results.json"), JSON.stringify(out, null, 2));

const kb = (b) => (b / 1024).toFixed(1).padStart(7);
console.log(`\n${out.date}, Node ${out.node}, медіана з ${runs}\n`);
console.log("варіант".padEnd(10), "CSS".padStart(7), "gzip".padStart(7), "br".padStart(7), " | JS gzip", "| CSS+JS gzip", "| білд");
for (const [v, d] of Object.entries(out.variants)) {
    console.log(v.padEnd(10), kb(d.css.raw), kb(d.css.gzip), kb(d.css.brotli), " |", kb(d.js.gzip), " |", kb(d.css.gzip + d.js.gzip), "    |", `${d.buildMs} ms`);
}
