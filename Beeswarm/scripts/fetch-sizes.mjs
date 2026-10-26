// Тягне розміри з bundlephobia і друкує src/data.js.
// Запуск: node scripts/fetch-sizes.mjs > src/data.js   (Node 18+, без залежностей)
// bundlephobia міряє повний імпорт пакета (min + gzip) для останньої версії; запити - по черзі, щоб не впертися в ліміт.
const LIBS = [
  ["clsx", "util"], ["zustand", "state"], ["nanoid", "util"], ["dayjs", "date"], ["preact", "ui"],
  ["solid-js", "ui"], ["ky", "http"], ["svelte", "ui"], ["@reduxjs/toolkit", "state"], ["valibot", "valid"],
  ["date-fns", "date"], ["axios", "http"], ["moment", "date"], ["lodash", "util"], ["jquery", "ui"],
  ["vue", "ui"], ["chart.js", "viz"], ["zod", "valid"], ["d3", "viz"], ["three", "viz"],
];

const rows = [];
for (const [pkg, cat] of LIBS) {
  const res = await fetch(`https://bundlephobia.com/api/size?package=${encodeURIComponent(pkg)}`, {
    headers: { "user-agent": "nby-beeswarm-demo" },
  });
  const d = await res.json();
  rows.push({ name: pkg, version: d.version, kb: Math.round(d.gzip / 10) / 100, cat });
  await new Promise((r) => setTimeout(r, 800));
}

console.log(`// Розмір повного імпорту, min + gzip, KB - bundlephobia.com (${new Date().toISOString().slice(0, 10)})
// Згенеровано: node scripts/fetch-sizes.mjs > src/data.js
export const LIBS = [
${rows.map((r) => `  { name: "${r.name}", version: "${r.version}", kb: ${r.kb}, cat: "${r.cat}" },`).join("\n")}
];`);
