// Prisma 6, Prisma 7 і Drizzle на одній SQLite-базі NBY Shop (2 000 товарів, 40 000 відгуків, 2 000 замовлень).
//   node bench-all.mjs <робоча папка з dz/ p6/ p7/> <seed.db> [runs=5]  →  results.json
// Кожен прогін - окремий процес на свіжій копії бази. Два режими запуску:
//   bundled  - код застосунку і ORM зібрані esbuild в один файл (як у серверному бандлі); better-sqlite3 і @prisma/client 6 - зовнішні;
//   external - звичайний node без бандла, пакети з node_modules.
import { execFileSync } from "node:child_process";
import { copyFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { cpus } from "node:os";
const [W, seedDb, runsArg] = process.argv.slice(2);
const runs = Number(runsArg || 5);
const LIBS = { drizzle: "dz", prisma6: "p6", prisma7: "p7" };
const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const out = { date: new Date().toISOString().slice(0, 10), node: process.version, cpus: cpus().length, runs, results: {} };
const raw = {};
for (let r = 0; r < runs; r++) for (const [lib, dir] of Object.entries(LIBS)) for (const mode of ["bundled", "external"]) {
    const db = `/tmp/orm-bench-${lib}.db`;
    copyFileSync(seedDb, db); rmSync(db + "-journal", { force: true });
    const file = mode === "bundled" ? "bench-bundled.mjs" : "bench.mjs";
    const res = JSON.parse(execFileSync(process.execPath, [file, db], { cwd: join(W, dir), encoding: "utf8" }).trim().split("\n").pop());
    ((raw[lib] ??= {})[mode] ??= []).push(res);
    console.log(`${lib.padEnd(8)} ${mode.padEnd(8)} run ${r + 1}: cold ${res.coldMs} ms · catalog ${res.catalog.medUs} µs · page ${res.productPage.medUs} µs · order ${res.createOrder.medUs} µs`);
}
for (const [lib, modes] of Object.entries(raw)) {
    const b = modes.bundled, e = modes.external;
    out.results[lib] = {
        coldBundledMs: med(b.map((x) => x.coldMs)), coldExternalMs: med(e.map((x) => x.coldMs)),
        catalogUs: med(b.map((x) => x.catalog.medUs)), productPageUs: med(b.map((x) => x.productPage.medUs)), createOrderUs: med(b.map((x) => x.createOrder.medUs)),
        raw: modes,
    };
}
console.table(Object.fromEntries(Object.entries(out.results).map(([k, v]) => [k, { ...v, raw: undefined }])));
writeFileSync(join(process.cwd(), "results.json"), JSON.stringify(out, null, 2));
