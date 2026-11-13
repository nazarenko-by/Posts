// Час лінту й перевірки форматування: ESLint + Prettier, Biome, Oxlint + Oxfmt на одному проєкті.
//   node scripts/bench.mjs <шлях до проєкту> [runs=5]  →  results.json
// У проєкті мають бути eslint, prettier, @biomejs/biome, oxlint, oxfmt та їхні конфіги (див. README).
// Команди викликаються з node_modules/.bin, без npx. Час - «стіна» від запуску процесу до виходу,
// медіана з runs; перед замірами один прогрів. Щоб порівнювати на 2 ядрах: taskset -c 0,1 node scripts/bench.mjs …
import { spawnSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { availableParallelism } from "node:os";

const project = resolve(process.argv[2] || ".");
const runs = Number(process.argv[3] || 5);
const bin = (name) => join(project, "node_modules", ".bin", name);
const ver = (name) => spawnSync(bin(name), ["--version"], { encoding: "utf8" }).stdout.trim().split("\n")[0].replace(/^\D*/, "");

const CASES = [
    { key: "eslint", label: "eslint .", cmd: [bin("eslint"), "."] },
    { key: "eslintCache", label: "eslint --cache . (теплий кеш)", cmd: [bin("eslint"), "--cache", "."] },
    { key: "prettier", label: "prettier --check .", cmd: [bin("prettier"), "--check", "."] },
    { key: "biomeLint", label: "biome lint .", cmd: [bin("biome"), "lint", "."] },
    { key: "biomeFormat", label: "biome format .", cmd: [bin("biome"), "format", "."] },
    { key: "biomeCheck", label: "biome check . (лінт + формат)", cmd: [bin("biome"), "check", "."] },
    { key: "oxlint", label: "oxlint .", cmd: [bin("oxlint"), "."] },
    { key: "oxfmt", label: "oxfmt --check", cmd: [bin("oxfmt"), "--check"] },
];

const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const run = (cmd) => {
    const t0 = performance.now();
    const r = spawnSync(cmd[0], cmd.slice(1), { cwd: project, encoding: "utf8" });
    return { ms: performance.now() - t0, code: r.status };
};

rmSync(join(project, ".eslintcache"), { force: true });
const out = {
    date: new Date().toISOString().slice(0, 10),
    node: process.version,
    cpus: availableParallelism(),
    runs,
    versions: Object.fromEntries(["eslint", "prettier", "biome", "oxlint", "oxfmt"].map((n) => [n, ver(n)])),
    cases: {},
};
for (const c of CASES) {
    run(c.cmd); // прогрів (для --cache - це і є заповнення кешу)
    const times = Array.from({ length: runs }, () => run(c.cmd).ms);
    out.cases[c.key] = { label: c.label, ms: Math.round(med(times)), all: times.map(Math.round) };
    console.log(c.label.padEnd(34), `${out.cases[c.key].ms} ms`.padStart(9), JSON.stringify(out.cases[c.key].all));
}
const k = out.cases;
out.totals = {
    eslintPlusPrettier: k.eslint.ms + k.prettier.ms,
    biomeCheck: k.biomeCheck.ms,
    oxlintPlusOxfmt: k.oxlint.ms + k.oxfmt.ms,
};
console.log("\n", out.totals);
writeFileSync(fileURLToPath(new URL("../results.json", import.meta.url)), JSON.stringify(out, null, 2));
