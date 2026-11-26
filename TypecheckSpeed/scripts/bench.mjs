// Скільки триває перевірка типів проєкту: TypeScript 5.9 і 6.0 (компілятор на JS) проти 7.0 і 7.1 beta (нативний, на Go).
//   node scripts/bench.mjs <шлях до проєкту> <папка з версіями> [runs=5]  →  results.json
// <папка з версіями>/v<версія>/node_modules/.bin/tsc - кожна версія встановлена окремо (npm i typescript@<версія>).
// Сценарії (tsc -p tsconfig.json --noEmit):
//   full  - з нуля, --incremental false (CI, pre-commit без кешу);
//   warm  - --incremental з готовим .tsbuildinfo, без змін у коді (повторна перевірка).
// Версії чергуються; пам'ять - пік RSS процесу tsc (опитування кожні 50 мс); помилки - кількість рядків "error TS".
import { spawn, execSync } from "node:child_process";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir, cpus } from "node:os";
import { fileURLToPath } from "node:url";

const project = resolve(process.argv[2] || ".");
const versionsDir = resolve(process.argv[3] || "./ts");
const runs = Number(process.argv[4] || 5);
const VERSIONS = ["5.9.3", "6.0.3", "7.0.2", "7.1.0-beta"];
const tmp = mkdtempSync(join(tmpdir(), "tsbench-"));

function rssTree(pid) {
    try {
        const rows = execSync("ps -eo pid=,ppid=,rss=", { encoding: "utf8" }).trim().split("\n").map((l) => l.trim().split(/\s+/).map(Number));
        const kids = new Map(); for (const [p, pp] of rows) kids.set(pp, [...(kids.get(pp) || []), p]);
        const rss = new Map(rows.map(([p, , r]) => [p, r]));
        let sum = 0; const st = [pid];
        while (st.length) { const p = st.pop(); sum += rss.get(p) || 0; st.push(...(kids.get(p) || [])); }
        return sum * 1024;
    } catch { return 0; }
}

function tsc(v, args) {
    return new Promise((res) => {
        const t0 = performance.now();
        const child = spawn(join(versionsDir, `v${v}`, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.json", "--noEmit", ...args], { cwd: project });
        let out = "", peak = 0;
        const timer = setInterval(() => { peak = Math.max(peak, rssTree(child.pid)); }, 50);
        child.stdout.on("data", (d) => (out += d)); child.stderr.on("data", (d) => (out += d));
        child.on("close", () => {
            clearInterval(timer);
            res({ ms: Math.round(performance.now() - t0), peakMB: Math.round(peak / 1048576), errors: (out.match(/error TS\d+/g) || []).length });
        });
    });
}

const raw = Object.fromEntries(VERSIONS.map((v) => [v, { full: [], warm: [] }]));
for (let r = 0; r < runs; r++) for (const v of VERSIONS) {
    const info = join(tmp, `${v}.tsbuildinfo`);
    raw[v].full.push(await tsc(v, ["--incremental", "false"]));
    rmSync(info, { force: true });
    await tsc(v, ["--incremental", "--tsBuildInfoFile", info]);           // наповнюємо .tsbuildinfo
    raw[v].warm.push(await tsc(v, ["--incremental", "--tsBuildInfoFile", info]));
    console.log(`${v.padEnd(11)} run ${r + 1}: full ${raw[v].full.at(-1).ms} ms (${raw[v].full.at(-1).peakMB} MB, errors ${raw[v].full.at(-1).errors}) · warm ${raw[v].warm.at(-1).ms} ms`);
}
const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const out = { date: new Date().toISOString().slice(0, 10), node: process.version, cpus: cpus().length, runs, results: {} };
for (const v of VERSIONS) out.results[v] = {
    fullMs: med(raw[v].full.map((x) => x.ms)), warmMs: med(raw[v].warm.map((x) => x.ms)),
    peakMB: med(raw[v].full.map((x) => x.peakMB)), errors: raw[v].full[0].errors, raw: raw[v],
};
console.table(Object.fromEntries(Object.entries(out.results).map(([k, v]) => [k, { ...v, raw: undefined }])));
writeFileSync(fileURLToPath(new URL("../results.json", import.meta.url)), JSON.stringify(out, null, 2));
rmSync(tmp, { recursive: true, force: true });
