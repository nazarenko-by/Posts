// Тягне завантаження з api.npmjs.org і друкує src/data.js: тиждневе середнє (млн) по кварталах.
// Запуск: node scripts/fetch-npm.mjs > src/data.js   (Node 18+, без залежностей)
// Береться лише повний квартал: поточний незавершений пропускається.
const PACKAGES = [
  { key: "jest", name: "Jest", npm: "jest", color: "#f7768e" },
  { key: "vitest", name: "Vitest", npm: "vitest", color: "#9ece6a" },
  { key: "mocha", name: "Mocha", npm: "mocha", color: "#e0af68" },
  { key: "cypress", name: "Cypress", npm: "cypress", color: "#bb9af7" },
  { key: "playwright", name: "Playwright", npm: "@playwright/test", color: "#7dcfff" },
  { key: "jasmine", name: "Jasmine", npm: "jasmine-core", color: "#8a93c7" },
];
const FROM = "2023-01-01";
const now = new Date();
const qEnd = new Date(Date.UTC(now.getUTCFullYear(), Math.floor(now.getUTCMonth() / 3) * 3, 0)); // кінець останнього повного кварталу
const iso = (d) => d.toISOString().slice(0, 10);

// API віддає не більше 18 місяців за запит
function ranges() {
  const out = [];
  let a = new Date(`${FROM}T00:00:00Z`);
  while (a <= qEnd) {
    const b = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth() + 18, 0));
    out.push([a, b < qEnd ? b : qEnd]);
    a = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth() + 18, 1));
  }
  return out;
}

const rows = [];
for (const p of PACKAGES) {
  const sum = new Map(), days = new Map();
  for (const [a, b] of ranges()) {
    const json = await (await fetch(`https://api.npmjs.org/downloads/range/${iso(a)}:${iso(b)}/${p.npm}`)).json();
    for (const { day, downloads } of json.downloads ?? []) {
      const q = `${day.slice(0, 4)} Q${Math.floor((+day.slice(5, 7) - 1) / 3) + 1}`;
      sum.set(q, (sum.get(q) ?? 0) + downloads);
      days.set(q, (days.get(q) ?? 0) + 1);
    }
  }
  for (const [q, s] of sum) rows.push({ q, key: p.key, n: Math.round((s / days.get(q)) * 7 / 1e4) / 100 });
}
rows.sort((a, b) => a.q.localeCompare(b.q) || b.n - a.n);

console.log(`// Середні завантаження на тиждень (млн) з api.npmjs.org по кварталах.
// Згенеровано: node scripts/fetch-npm.mjs > src/data.js (${iso(now)})
export const PACKAGES = ${JSON.stringify(PACKAGES, null, 2).replace(/"(\w+)":/g, "$1:")};

export const ROWS = [
${rows.map((r) => `  { q: "${r.q}", key: "${r.key}", n: ${r.n} },`).join("\n")}
];`);
