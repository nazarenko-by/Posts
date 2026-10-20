// Тягне місячні завантаження з api.npmjs.org і друкує src/data.js.
// Запуск: node scripts/fetch-npm.mjs > src/data.js   (Node 18+, без залежностей)
// Значення = сума за місяць / днів у місяці × 7 / 1e6 → «млн завантажень на тиждень».
// Місяць, що в 2+ рази більший за обидва сусідні, вважаємо аномалією й замінюємо їх середнім.
const PACKAGES = [
  { key: "rspack", name: "Rspack", npm: "@rspack/core", color: "#f7768e" },
  { key: "webpack", name: "webpack", npm: "webpack", color: "#7aa2f7" },
  { key: "vite", name: "Vite", npm: "vite", color: "#bb9af7" },
  { key: "rolldown", name: "Rolldown", npm: "rolldown", color: "#ff9e64" },
];
const FROM = "2023-01";
const now = new Date();
const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)); // кінець минулого місяця

// API віддає не більше 18 місяців за запит - ріжемо на шматки
function ranges() {
  const out = [];
  let start = new Date(`${FROM}-01T00:00:00Z`);
  while (start <= last) {
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 18, 0));
    out.push([start, end < last ? end : last]);
    start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 18, 1));
  }
  return out;
}
const iso = (d) => d.toISOString().slice(0, 10);

const months = new Map();
const notes = [];
for (const p of PACKAGES) {
  const sum = new Map();
  for (const [a, b] of ranges()) {
    const res = await fetch(`https://api.npmjs.org/downloads/range/${iso(a)}:${iso(b)}/${p.npm}`);
    const json = await res.json();
    for (const { day, downloads } of json.downloads ?? []) {
      const m = day.slice(0, 7);
      sum.set(m, (sum.get(m) ?? 0) + downloads);
    }
  }
  const keys = [...sum.keys()].sort();
  const vals = keys.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    return (sum.get(m) / days) * 7 / 1e6;
  });
  for (let i = 1; i < vals.length - 1; i++) {
    if (vals[i] > 2 * vals[i - 1] && vals[i] > 2 * vals[i + 1] && vals[i] > 1) {
      notes.push(`${p.npm} за ${keys[i]}`);
      vals[i] = (vals[i - 1] + vals[i + 1]) / 2;
    }
  }
  keys.forEach((m, i) => {
    if (!months.has(m)) months.set(m, { month: m });
    months.get(m)[p.key] = Math.round(vals[i] * 10) / 10;
  });
}

const rows = [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
const fmt = (r) => `  { month: "${r.month}", ${PACKAGES.map((p) => `${p.key}: ${(r[p.key] ?? 0).toFixed(1)}`).join(", ")} },`;
console.log(`// Середні завантаження на тиждень (млн) з api.npmjs.org, ${rows[0].month} - ${rows.at(-1).month}.
// Згенеровано: node scripts/fetch-npm.mjs > src/data.js (${iso(now)})${notes.length ? `\n// Аномалії, замінені середнім сусідніх місяців: ${notes.join(", ")}.` : ""}
export const PACKAGES = ${JSON.stringify(PACKAGES, null, 2).replace(/"(\w+)":/g, "$1:")};

export const MONTHS = [
${rows.map(fmt).join("\n")}
];`);
