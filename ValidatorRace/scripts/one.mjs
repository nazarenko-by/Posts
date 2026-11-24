// Один валідатор в окремому процесі: холодний старт + гарячі ops/s.
//   node scripts/one.mjs <zod|zod-mini|valibot|arktype>   (потрібен build/<lib>.node.mjs з bench.mjs)
import { Bench } from "tinybench";
import { fileURLToPath } from "node:url";
const lib = process.argv[2];
const t0 = performance.now();
const m = await import(fileURLToPath(new URL(`../build/${lib}.node.mjs`, import.meta.url)));
const r0 = m.validate(m.valid);
const coldMs = performance.now() - t0; // імпорт + створення схеми + перший parse
if (!r0.ok) throw new Error(`${lib}: valid не пройшов`);
const bench = new Bench({ time: 1500, warmupTime: 300 });
bench.add("valid", () => m.validate(m.valid)).add("invalid", () => m.validate(m.invalid));
await bench.run();
const ops = Object.fromEntries(bench.tasks.map((t) => [t.name, Math.round(t.result.throughput?.mean ?? t.result.hz)]));
console.log(JSON.stringify({ lib, coldMs: +coldMs.toFixed(2), ...ops }));
