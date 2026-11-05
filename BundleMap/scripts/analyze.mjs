// Що всередині клієнтського бандла Next.js (Turbopack) - по маршрутах і пакетах.
//   1) у next.config: productionBrowserSourceMaps: true  →  next build
//   2) node scripts/analyze.mjs <шлях до проєкту> [bundle.json]  →  bundle.json (або інша назва, напр. bundle.after.json)
// Що рахуємо:
//   - JS маршруту = rootMainFiles (спільний рантайм) + entryJSFiles усіх сегментів маршруту з client-reference-manifest
//     (layout, page, error, loading, not-found) - те, що браузер вантажить при першому відкритті сторінки.
//     polyfillFiles (nomodule, лише старі браузери) не рахуємо.
//   - кожен чанк розкладаємо source-map-explorer на вихідні файли; байти - мініфіковані (як на диску), gzip - для чанків цілком.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, dirname, relative } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = process.argv[2] || ".";
const next = join(root, ".next");
const require = createRequire(import.meta.url);
const sme = join(dirname(require.resolve("source-map-explorer/package.json")), "bin", "cli.js");

const build = JSON.parse(readFileSync(join(next, "build-manifest.json"), "utf8"));
const shared = build.rootMainFiles;

// маршрути → client-reference-manifest
function walk(dir, out = []) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name === "page_client-reference-manifest.js") out.push(p);
    }
    return out;
}
const routes = {};
for (const f of walk(join(next, "server", "app"))) {
    const route = "/" + relative(join(next, "server", "app"), dirname(f)).split("\\").join("/");
    if (route.includes("_global-error") || route.includes("_not-found")) continue;
    globalThis.self = globalThis;
    globalThis.__RSC_MANIFEST = {};
    new Function(readFileSync(f, "utf8"))();
    const m = Object.values(globalThis.__RSC_MANIFEST)[0];
    const chunks = new Set(Object.values(m.entryJSFiles).flat());
    routes[route === "/." || route === "/" ? "/" : route.replace(/\/\.$/, "")] = [...chunks];
}

// чанки → вихідні файли
const all = [...new Set([...shared, ...Object.values(routes).flat()])];
const chunkInfo = {};
for (const c of all) {
    const file = join(next, c);
    const raw = readFileSync(file);
    let files = {};
    // карта береться з коментаря sourceMappingURL у кінці чанка (у Turbopack ім'я .map не збігається з ім'ям чанка)
    if (/sourceMappingURL=/.test(raw.subarray(-200).toString())) {
        const out = execFileSync("node", [sme, file, "--json", "--no-border-checks"], { maxBuffer: 64 << 20 }).toString();
        files = JSON.parse(out).results[0].files;
    }
    chunkInfo[c] = {
        bytes: raw.length,
        gzip: gzipSync(raw, { level: 9 }).length,
        files: Object.fromEntries(Object.entries(files).map(([k, v]) => [k.replace(/^turbopack:\/\/\/\[project\]\//, "").replace(/^turbopack:\/\/\/\[turbopack\]\//, "[turbopack]/"), v.size])),
    };
}

// групування: пакет npm або власна папка
export function groupOf(path) {
    if (path.startsWith("[turbopack]") || path === "[unmapped]" || path === "[sourceMappingURL]" || path === "[EOLs]") return { group: "next", leaf: path };
    const nm = path.lastIndexOf("node_modules/");
    if (nm >= 0) {
        const rest = path.slice(nm + 13).split("/");
        const pkg = rest[0].startsWith("@") ? rest[0] + "/" + rest[1] : rest[0];
        return { group: pkg, leaf: path.slice(nm + 13) };
    }
    return { group: "мій код", leaf: path };
}

const out = {
    date: new Date().toISOString().slice(0, 10),
    next: JSON.parse(readFileSync(join(root, "node_modules/next/package.json"), "utf8")).version,
    react: JSON.parse(readFileSync(join(root, "node_modules/react-dom/package.json"), "utf8")).version,
    shared,
    routes,
    chunks: chunkInfo,
};
writeFileSync(fileURLToPath(new URL("../" + (process.argv[3] || "bundle.json"), import.meta.url)), JSON.stringify(out, null, 1));

// короткий звіт
const sum = (cs, key) => cs.reduce((s, c) => s + chunkInfo[c][key], 0);
console.log(`next ${out.next}, react-dom ${out.react}, ${out.date}\n`);
console.log("маршрут".padEnd(22), "JS, KB".padStart(8), "gzip, KB".padStart(10));
for (const [r, cs] of Object.entries(routes).sort()) {
    const u = [...new Set([...shared, ...cs])];
    console.log(r.padEnd(22), (sum(u, "bytes") / 1024).toFixed(1).padStart(8), (sum(u, "gzip") / 1024).toFixed(1).padStart(10));
}
const groups = {};
for (const c of all) for (const [f, b] of Object.entries(chunkInfo[c].files)) {
    const g = groupOf(f).group;
    groups[g] = (groups[g] || 0) + b;
}
console.log("\nусі чанки разом, за пакетами (мінімізовані байти):");
for (const [g, b] of Object.entries(groups).sort((a, b) => b[1] - a[1])) console.log(g.padEnd(28), (b / 1024).toFixed(1).padStart(8), "KB");
