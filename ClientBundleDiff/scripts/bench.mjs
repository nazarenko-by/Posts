// Скільки JS тримають на сервері Server Components: той самий проєкт «як є» і з "use client" на кожному серверному компоненті.
//   DATABASE_URL=... AUTH_SECRET=... node scripts/bench.mjs <шлях до Next.js-проєкту> [runs=3]
// Що робить:
//   1) копіює проєкт у тимчасову папку (без .next; node_modules копіюється - Turbopack не приймає симлінк поза коренем);
//   2) додає next.config.mjs з productionBrowserSourceMaps: true (якщо свого next.config немає);
//   3) «як є»: next build × runs → scripts/analyze.mjs → asis.json;
//   4) дописує "use client" першим рядком у файли зі списку CLIENT_FILES → next build × runs → allclient.json;
//   5) пише results.json: медіана JS і gzip по маршрутах для обох варіантів + розкид між збірками.
// Для NBY Shop потрібна база з товарами (prisma db push + db:seed): generateStaticParams читає її під час білда.
import { execFileSync, execSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// серверні компоненти NBY Shop без доступу до БД/cookies - ті, що могли б бути клієнтськими
const CLIENT_FILES = [
    "components/EmptyState.tsx", "components/Footer.tsx", "components/Hero.tsx", "components/RatingStars.tsx",
    "components/ReviewsSection.tsx", "components/ProductGridSkeleton.tsx", "components/ui/button.tsx",
    "app/not-found.tsx", "app/loading.tsx", "app/search/loading.tsx",
];

const src = resolve(process.argv[2] || ".");
const runs = Number(process.argv[3] || 3);
const here = fileURLToPath(new URL("..", import.meta.url));
const work = mkdtempSync(join(tmpdir(), "cbd-"));
console.log(`копія: ${work}`);
// verbatimSymlinks: інакше відносні симлінки в node_modules стануть абсолютними (у вихідний проєкт) → два екземпляри next
cpSync(src, work, { recursive: true, verbatimSymlinks: true, filter: (p) => !/[\\/]\.next([\\/]|$)/.test(p) && !/[\\/]\.git$/.test(p) });
if (!["js", "mjs", "ts"].some((e) => existsSync(join(work, `next.config.${e}`)))) {
    writeFileSync(join(work, "next.config.mjs"), "export default { productionBrowserSourceMaps: true };\n");
} else {
    console.log("⚠️ у проєкті є свій next.config - додай туди productionBrowserSourceMaps: true вручну");
}

function measure(name) {
    const sums = [];
    for (let i = 1; i <= runs; i++) {
        rmSync(join(work, ".next"), { recursive: true, force: true });
        execSync("npx next build", { cwd: work, stdio: "ignore", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } });
        execFileSync("node", [join(here, "scripts/analyze.mjs"), work, `${name}.json`], { stdio: "ignore" });
        const d = JSON.parse(readFileSync(join(here, `${name}.json`), "utf8"));
        sums.push(Object.fromEntries(Object.entries(d.routes).map(([r, cs]) => {
            const all = [...new Set([...d.shared, ...cs])];
            return [r, { js: all.reduce((s, c) => s + d.chunks[c].bytes, 0), gzip: all.reduce((s, c) => s + d.chunks[c].gzip, 0) }];
        })));
        console.log(`${name}: збірка ${i}/${runs}`);
    }
    // медіана по кожному маршруту
    const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    const routes = Object.keys(sums[0]);
    // розкид між збірками, байти (найбільший по маршрутах) - показує, наскільки збірки відтворювані
    const spread = (key) => Math.max(...Object.keys(sums[0]).map((r) => {
        const xs = sums.map((s) => s[r][key]);
        return Math.max(...xs) - Math.min(...xs);
    }));
    return {
        spread: { js: spread("js"), gzip: spread("gzip") },
        routes: Object.fromEntries(routes.map((r) => [r, { js: med(sums.map((s) => s[r].js)), gzip: med(sums.map((s) => s[r].gzip)) }])),
    };
}

const asis = measure("asis");
for (const f of CLIENT_FILES) {
    const p = join(work, f);
    const code = readFileSync(p, "utf8");
    if (!code.startsWith('"use client"')) writeFileSync(p, `"use client";\n\n${code}`);
}
const allclient = measure("allclient");

const kb = (b) => (b / 1024).toFixed(1);
const out = { date: new Date().toISOString().slice(0, 10), runs, clientFiles: CLIENT_FILES, asis, allclient };
writeFileSync(join(here, "results.json"), JSON.stringify(out, null, 2));
console.log(`\nрозкид між збірками, байт: як є - JS ${asis.spread.js} / gzip ${asis.spread.gzip}; "use client" - JS ${allclient.spread.js} / gzip ${allclient.spread.gzip}\n`);
console.log("маршрут".padEnd(20), "як є".padStart(8), "use client".padStart(11), "різниця".padStart(9), "gzip +".padStart(8));
for (const r of Object.keys(asis.routes).sort()) {
    const a = asis.routes[r], b = allclient.routes[r];
    console.log(r.padEnd(20), kb(a.js).padStart(8), kb(b.js).padStart(11), ("+" + kb(b.js - a.js)).padStart(9), ("+" + kb(b.gzip - a.gzip)).padStart(8));
}
rmSync(work, { recursive: true, force: true });
