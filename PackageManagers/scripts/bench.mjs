// Скільки триває install одного проєкту: npm, pnpm, Yarn і Bun.
//   node scripts/bench.mjs <шлях до проєкту> [runs=3] [workDir=/tmp/pm-bench]  →  results.json
// Для кожного менеджера - окрема копія проєкту (без node_modules і чужих lockfile) і окремий кеш.
//   lockfile генерується один раз до замірів (не міряється) - як у справжньому репо, де lockfile закомічений;
//   cold - порожній кеш і немає node_modules (CI без кешу);
//   warm - кеш лишився, node_modules видалено (CI з кешем / свіжий clone на своїй машині).
// Усі - з --ignore-scripts (postinstall у пакетах і проєкту не запускаються), щоб міряти саме встановлення.
// Yarn 4 - з nodeLinker: node-modules, щоб порівнювати однакову структуру (за замовчуванням у Yarn 4 - PnP).
// Розмір - du -sk node_modules (файли pnpm і Bun можуть бути hardlink на кеш - на диску їх не вдвічі більше).
import { execSync } from "node:child_process";
import { cpSync, rmSync, mkdirSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { cpus } from "node:os";
import { fileURLToPath } from "node:url";

const project = resolve(process.argv[2] || ".");
const runs = Number(process.argv[3] || 3);
const work = resolve(process.argv[4] || "/tmp/pm-bench");
const YARN = "corepack yarn@4.19.0";

const PMS = {
    npm: {
        lock: "package-lock.json",
        env: (c) => ({ npm_config_cache: c }),
        gen: "npm install --package-lock-only --ignore-scripts --no-audit --no-fund",
        install: "npm ci --ignore-scripts --no-audit --no-fund",
        version: "npm -v",
    },
    pnpm: {
        lock: "pnpm-lock.yaml",
        env: (c) => ({ PNPM_BENCH_CACHE: c }),
        gen: "pnpm install --lockfile-only --ignore-scripts --store-dir \"$PNPM_BENCH_CACHE/store\" --cache-dir \"$PNPM_BENCH_CACHE/cache\"",
        install: "pnpm install --frozen-lockfile --ignore-scripts --store-dir \"$PNPM_BENCH_CACHE/store\" --cache-dir \"$PNPM_BENCH_CACHE/cache\"",
        version: "pnpm -v",
    },
    yarn: {
        lock: "yarn.lock",
        env: (c) => ({ YARN_GLOBAL_FOLDER: c, YARN_ENABLE_GLOBAL_CACHE: "true", YARN_NODE_LINKER: "node-modules",
            YARN_ENABLE_SCRIPTS: "false", YARN_ENABLE_TELEMETRY: "0", COREPACK_ENABLE_STRICT: "0" }),
        gen: `${YARN} install --mode=update-lockfile`,
        install: `${YARN} install --immutable`,
        version: `${YARN} -v`,
    },
    bun: {
        lock: "bun.lock",
        env: (c) => ({ BUN_INSTALL_CACHE_DIR: c }),
        gen: "bun install --lockfile-only --ignore-scripts",
        install: "bun install --frozen-lockfile --ignore-scripts",
        version: "bun -v",
    },
};
const LOCKS = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"];

const sh = (cmd, cwd, env) => execSync(cmd, { cwd, env: { ...process.env, ...env, CI: "1" }, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 64 << 20 });
const time = (cmd, cwd, env) => { const t0 = performance.now(); sh(cmd, cwd, env); return Math.round(performance.now() - t0); };
const du = (p) => +sh(`du -sk ${JSON.stringify(p)}`).split("\t")[0];
const files = (p) => +sh(`find ${JSON.stringify(p)} -type f | wc -l`).trim();

// підготовка: копія проєкту + lockfile для кожного менеджера
const setup = {};
for (const [pm, cfg] of Object.entries(PMS)) {
    const dir = join(work, pm, "project"), cache = join(work, pm, "cache");
    rmSync(join(work, pm), { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (const f of readdirSync(project)) {
        if (["node_modules", ".next", ".git", ".yarn", ...LOCKS].includes(f)) continue;
        cpSync(join(project, f), join(dir, f), { recursive: true });
    }
    const env = cfg.env(cache);
    sh(cfg.gen, dir, env);
    if (!existsSync(join(dir, cfg.lock))) throw new Error(`${pm}: lockfile не створено`);
    setup[pm] = { dir, cache, env, version: sh(cfg.version, dir, env).trim() };
    console.log(`${pm} ${setup[pm].version}: lockfile готовий`);
}

const raw = Object.fromEntries(Object.keys(PMS).map((pm) => [pm, { cold: [], warm: [] }]));
for (let r = 0; r < runs; r++) for (const [pm, cfg] of Object.entries(PMS)) {
    const { dir, cache, env } = setup[pm];
    rmSync(join(dir, "node_modules"), { recursive: true, force: true });
    rmSync(cache, { recursive: true, force: true });
    const cold = time(cfg.install, dir, env);
    rmSync(join(dir, "node_modules"), { recursive: true, force: true });
    const warm = time(cfg.install, dir, env);
    raw[pm].cold.push(cold); raw[pm].warm.push(warm);
    console.log(`${pm.padEnd(5)} run ${r + 1}: cold ${cold} ms · warm ${warm} ms`);
}

const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const out = { date: new Date().toISOString().slice(0, 10), node: process.version, cpus: cpus().length, runs, results: {} };
for (const pm of Object.keys(PMS)) {
    const { dir, cache, version } = setup[pm];
    out.results[pm] = {
        version, coldMs: med(raw[pm].cold), warmMs: med(raw[pm].warm),
        nodeModulesMB: +(du(join(dir, "node_modules")) / 1024).toFixed(1),
        nodeModulesFiles: files(join(dir, "node_modules")),
        cacheMB: +(du(cache) / 1024).toFixed(1),
        raw: raw[pm],
    };
}
console.table(Object.fromEntries(Object.entries(out.results).map(([k, v]) => [k, { ...v, raw: undefined }])));
writeFileSync(fileURLToPath(new URL("../results.json", import.meta.url)), JSON.stringify(out, null, 2));
