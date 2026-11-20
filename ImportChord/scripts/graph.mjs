// Граф імпортів проєкту → src/data.json для chord diagram.
//   node scripts/graph.mjs <шлях до проєкту> [папки...]
//   за замовчуванням папки: app components lib hooks store context (структура Next.js App Router)
// madge читає імпорти .ts/.tsx з урахуванням tsconfig (аліаси @/...). Імпорти з node_modules не рахуються.
import madge from "madge";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(process.argv[2] || ".");
const dirs = process.argv.length > 3 ? process.argv.slice(3) : ["app", "components", "lib", "hooks", "store", "context"];

process.chdir(project); // madge розв'язує аліаси tsconfig відносно поточної папки
const res = await madge(dirs, {
    fileExtensions: ["ts", "tsx"],
    tsConfig: "tsconfig.json",
});
const graph = res.obj();
const group = (file) => file.split("/")[0];

// порядок груп - за кількістю зв'язків (вихідні + вхідні), щоб великі дуги стояли поруч
const names = [...new Set(Object.keys(graph).map(group))];
const matrix = names.map(() => names.map(() => 0));
const fileIn = {};
let edges = 0;
for (const [file, deps] of Object.entries(graph)) for (const dep of deps) {
    matrix[names.indexOf(group(file))][names.indexOf(group(dep))]++;
    fileIn[dep] = (fileIn[dep] || 0) + 1;
    edges++;
}
const total = (i) => matrix[i].reduce((a, b) => a + b, 0) + matrix.reduce((a, row) => a + row[i], 0);
const order = names.map((_, i) => i).sort((a, b) => total(b) - total(a));
const out = {
    date: new Date().toISOString().slice(0, 10),
    files: Object.keys(graph).length,
    edges,
    circular: res.circular().length,
    names: order.map((i) => names[i]),
    matrix: order.map((i) => order.map((j) => matrix[i][j])),
    topImported: Object.entries(fileIn).sort((a, b) => b[1] - a[1]).slice(0, 10),
    // пари «папка → папка» з прикладами файлів - для тултипа
    examples: Object.fromEntries(order.flatMap((i) => order.map((j) => {
        const key = `${names[i]}→${names[j]}`;
        const list = Object.entries(graph).flatMap(([f, deps]) => deps.filter((d) => group(f) === names[i] && group(d) === names[j]).map((d) => `${f} → ${d}`));
        return [key, list.slice(0, 6)];
    })).filter(([, l]) => l.length)),
};
writeFileSync(fileURLToPath(new URL("../src/data.json", import.meta.url)), JSON.stringify(out, null, 2));
console.log(`${out.files} файлів · ${out.edges} імпортів · циклів: ${out.circular}`);
console.table(Object.fromEntries(out.names.map((n, i) => [n, Object.fromEntries(out.names.map((m, j) => [m, out.matrix[i][j]]))])));
