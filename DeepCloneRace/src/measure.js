// Медіана часу одного клонування: прогрів, потім 15 вимірів-пачок по ~40 мс (пачка ділиться на кількість викликів).
import { CASES } from "./cases.js";
import { METHODS, correct } from "./methods.js";
export function measure(method, caseName) {
    const src = CASES[caseName]();
    const fn = METHODS[method];
    let out;
    try { out = fn(src); } catch (e) { return { ok: false, error: String(e.message || e).slice(0, 80) }; }
    const ok = correct(caseName, src, out);
    let n = 1, t = 0;
    while (t < 40) { n *= 2; const s = performance.now(); for (let i = 0; i < n; i++) fn(src); t = performance.now() - s; }
    const xs = [];
    for (let k = 0; k < 15; k++) { const s = performance.now(); for (let i = 0; i < n; i++) fn(src); xs.push((performance.now() - s) / n); }
    xs.sort((a, b) => a - b);
    return { ok, us: +(xs[7] * 1000).toFixed(2) };
}
