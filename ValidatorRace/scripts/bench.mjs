// Zod, Zod Mini, Valibot і ArkType на справжній схемі оформлення замовлення NBY Shop (lib/checkout-schema.ts).
//   node scripts/bench.mjs [runs=5]  →  results.json
// 1) вага: esbuild-бандл для браузера (minify, esm) з точкою входу «схема + validate()» → байти, gzip, brotli;
// 2) швидкість: кожен валідатор в окремому процесі Node runs разів - холодний старт (імпорт + схема + перший parse)
//    і гарячі ops/s через tinybench на валідній формі та на формі з 5 помилками; беремо медіану.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { cpus } from "node:os";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const runs = Number(process.argv[2] || 5);
const LIBS = ["zod", "zod-mini", "valibot", "arktype"];
const PKG = { zod: "zod", "zod-mini": "zod", valibot: "valibot", arktype: "arktype" };
mkdirSync(here("../build"), { recursive: true });

const out = { date: new Date().toISOString().slice(0, 10), node: process.version, cpus: cpus().length, runs,
    versions: Object.fromEntries(["zod", "valibot", "arktype", "esbuild"].map((p) => [p, JSON.parse(readFileSync(here(`../node_modules/${p}/package.json`), "utf8")).version])), results: {} };

for (const lib of LIBS) {
    const entry = `export { validate } from "./schemas/${lib}";`;
    // браузерний бандл - те, що поїде клієнту, якщо форма валідує на клієнті
    const web = await build({ stdin: { contents: entry, resolveDir: here(".."), loader: "ts" }, bundle: true, minify: true,
        format: "esm", platform: "browser", write: false, legalComments: "none" });
    const code = web.outputFiles[0].contents;
    // Node-бандл для замірів швидкості (з тестовими даними)
    await build({ stdin: { contents: `${entry}\nexport { valid, invalid } from "./schemas/inputs";`, resolveDir: here(".."), loader: "ts" },
        bundle: true, format: "esm", platform: "node", outfile: here(`../build/${lib}.node.mjs`), logLevel: "warning" });
    const r = [];
    for (let i = 0; i < runs; i++) r.push(JSON.parse(execFileSync(process.execPath, [here("./one.mjs"), lib], { encoding: "utf8" })));
    const med = (k) => r.map((x) => x[k]).sort((a, b) => a - b)[Math.floor(r.length / 2)];
    out.results[lib] = {
        package: PKG[lib],
        bundle: { minKB: +(code.length / 1024).toFixed(1), gzipKB: +(gzipSync(code).length / 1024).toFixed(1),
            brotliKB: +(brotliCompressSync(code).length / 1024).toFixed(1) },
        coldMs: med("coldMs"), validOps: med("valid"), invalidOps: med("invalid"), raw: r,
    };
    console.log(lib.padEnd(9), JSON.stringify({ ...out.results[lib], raw: undefined }));
}
writeFileSync(here("../results.json"), JSON.stringify(out, null, 2));
