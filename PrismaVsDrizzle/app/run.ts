// Один ORM в окремому процесі: холодний старт + медіани запитів.
//   node build/<orm>.mjs <файл бази>
// час рахуємо від старту процесу (performance.now() = мс з timeOrigin), бо імпорти пакетів у бандлі - статичні
const { open } = await import(__ORM__);
const db = open(process.argv[2]);
const first = await db.catalog();
const coldMs = performance.now(); // старт Node + імпорт ORM + клієнт + підключення + перший запит
if (first.length !== 24) throw new Error("catalog != 24");
const page = await db.productPage("product-42");
if (page.p.reviews.length !== 10 || page.count !== 20) throw new Error("productPage mismatch " + JSON.stringify([page.p.reviews.length, page.count]));
const timeIt = async (fn: () => Promise<unknown>, n: number) => {
    for (let i = 0; i < 200; i++) await fn();
    const xs: number[] = [];
    for (let i = 0; i < n; i++) { const s = performance.now(); await fn(); xs.push(performance.now() - s); }
    xs.sort((a, b) => a - b);
    return { medUs: Math.round(xs[n >> 1] * 1000), p95Us: Math.round(xs[Math.floor(n * 0.95)] * 1000) };
};
let k = 0;
const out = {
    coldMs: +coldMs.toFixed(1),
    catalog: await timeIt(() => db.catalog(), 2000),
    productPage: await timeIt(() => db.productPage(`product-${(k++ % 1800) + 1}`), 2000),
    createOrder: await timeIt(() => db.createOrder(), 1000),
    avg: page.avg,
};
await db.close();
console.log(JSON.stringify(out));
