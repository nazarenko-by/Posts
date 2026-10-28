// Збирає «день тижня × година» з git log твоїх репо і друкує src/data.js.
// Запуск: node scripts/commits.mjs ../repo-a ../repo-b > src/data.js
//   TZ_NAME=Europe/Kyiv (за замовчуванням) - у якому часовому поясі рахувати години.
//   AUTHOR=you@example.com - (опційно) лише твої коміти.
// Береться тільки дата автора (%aI) - без назв репо, повідомлень і файлів.
import { execFileSync } from "node:child_process";

const repos = process.argv.slice(2);
if (!repos.length) {
  console.error("usage: node scripts/commits.mjs <repo> [repo...] > src/data.js");
  process.exit(1);
}
const tz = process.env.TZ_NAME || "Europe/Kyiv";
const author = process.env.AUTHOR;

const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", hourCycle: "h23" });
const DAY = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
let total = 0, first = null, last = null;
for (const repo of repos) {
  const args = ["-C", repo, "log", "--format=%aI"];
  if (author) args.push(`--author=${author}`);
  const lines = execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean);
  for (const iso of lines) {
    const date = new Date(iso);
    const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
    grid[DAY[parts.weekday]][Number(parts.hour)] += 1;
    total += 1;
    if (!first || date < first) first = date;
    if (!last || date > last) last = date;
  }
}

console.log(`// Коміти: день тижня (пн..нд) × година (${tz}). ${total} комітів, ${first?.toISOString().slice(0, 10)} - ${last?.toISOString().slice(0, 10)}.
// Згенеровано: node scripts/commits.mjs <repo...> > src/data.js
export const GRID = [
${grid.map((row) => `  [${row.join(", ")}],`).join("\n")}
];`);
