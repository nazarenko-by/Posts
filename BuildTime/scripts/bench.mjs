// Час збірки Next.js-проєкту: Turbopack (next build) проти webpack (next build --webpack).
//   node scripts/bench.mjs <шлях до проєкту> [runs=3]  →  results.json
// cold - перед збіркою видаляємо .next (і кеш); warm - друга збірка поспіль без змін у коді, кеш у .next лишається.
// Збирачі чергуються (turbo, webpack, turbo, ...), щоб нагрів машини не грав на одного з них.
// Міряємо: стіну від запуску до виходу процесу, фазу «Compiled successfully in Xs» з логу Next.js,
// пік пам'яті (сума RSS усіх процесів дерева, опитування кожні 100 мс) і вагу клієнтського JS (.next/static/chunks, gzip).
import { spawn, execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { cpus } from "node:os";
import { fileURLToPath } from "node:url";

const project = resolve(process.argv[2] || ".");
const runs = Number(process.argv[3] || 3);
const nextBin = join(project, "node_modules", ".bin", "next");
const VARIANTS = { turbopack: [], webpack: ["--webpack"] };

function treeRss(pid) {
    try {
        const out = execSync(`ps -eo pid=,ppid=,rss=`, { encoding: "utf8" });
        const rows = out.trim().split("\n").map((l) => l.trim().split(/\s+/).map(Number));
        const kids = new Map();
        for (const [p, pp] of rows) kids.set(pp, [...(kids.get(pp) || []), p]);
        const rss = new Map(rows.map(([p, , r]) => [p, r]));
        let sum = 0; const stack = [pid];
        while (stack.length) { const p = stack.pop(); sum += rss.get(p) || 0; stack.push(...(kids.get(p) || [])); }
        return sum * 1024;
    } catch { return 0; }
}

function build(args) {
    return new Promise((res, rej) => {
        const t0 = performance.now();
        const child = spawn(nextBin, ["build", ...args], { cwd: project, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
        let log = "", peak = 0;
        const timer = setInterval(() => { peak = Math.max(peak, treeRss(child.pid)); }, 100);
        child.stdout.on("data", (d) => (log += d));
        child.stderr.on("data", (d) => (log += d));
        child.on("close", (code) => {
            clearInterval(timer);
            if (code !== 0) return rej(new Error(log.slice(-2000)));
            const m = log.match(/Compiled successfully in ([\d.]+)(ms|s)/);
            const compileMs = m ? (m[2] === "s" ? +m[1] * 1000 : +m[1]) : null;
            res({ wallMs: Math.round(performance.now() - t0), compileMs, peakMB: Math.round(peak / 1048576) });
        });
    });
}

function clientJs() {
    const dir = join(project, ".next", "static", "chunks");
    let raw = 0, gz = 0, files = 0;
    const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) { const b = readFileSync(p); raw += b.length; gz += gzipSync(b).length; files++; } } };
    walk(dir);
    return { files, rawKB: +(raw / 1024).toFixed(1), gzipKB: +(gz / 1024).toFixed(1) };
}

const out = { date: new Date().toISOString().slice(0, 10), node: process.version, cpus: cpus().length, runs,
    next: JSON.parse(readFileSync(join(project, "node_modules/next/package.json"), "utf8")).version, runsRaw: {}, median: {} };
for (const v of Object.keys(VARIANTS)) out.runsRaw[v] = { cold: [], warm: [] };
for (let r = 0; r < runs; r++) for (const [v, args] of Object.entries(VARIANTS)) {
    rmSync(join(project, ".next"), { recursive: true, force: true });
    const cold = await build(args);
    const warm = await build(args);
    out.runsRaw[v].cold.push(cold); out.runsRaw[v].warm.push(warm);
    if (r === 0) out.runsRaw[v].clientJs = clientJs();
    console.log(`${v.padEnd(9)} run ${r + 1}: cold ${cold.wallMs} ms (compile ${cold.compileMs}, ${cold.peakMB} MB) · warm ${warm.wallMs} ms (compile ${warm.compileMs})`);
}
const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
for (const [v, d] of Object.entries(out.runsRaw)) {
    const m = (k, f) => med(d[k].map((x) => x[f]));
    out.median[v] = { coldWallMs: m("cold", "wallMs"), coldCompileMs: m("cold", "compileMs"), warmWallMs: m("warm", "wallMs"),
        warmCompileMs: m("warm", "compileMs"), peakMB: m("cold", "peakMB"), clientJs: d.clientJs };
}
console.table(Object.fromEntries(Object.entries(out.median).map(([k, v]) => [k, { ...v, clientJs: `${v.clientJs.gzipKB} KB gz` }])));
writeFileSync(fileURLToPath(new URL("../results.json", import.meta.url)), JSON.stringify(out, null, 2));
