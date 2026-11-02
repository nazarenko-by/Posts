// Мок-API: кожен виклик - нова затримка, /orders може «впасти» з 500
const DELAYS = { user: 300, orders: 600, recs: 1100 };
const DATA = { user: "Богдан", orders: "3 замовлення", recs: "5 рекомендацій" };

export function createApi({ failOrders, log }) {
  const t0 = performance.now();
  const call = (name) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const ms = Math.round(performance.now() - t0);
      if (name === "orders" && failOrders()) {
        log(`/${name} ✗ 500 · ${ms} ms`);
        reject(new Error(`/${name}: 500`));
      } else {
        log(`/${name} ✓ · ${ms} ms`);
        resolve(DATA[name]);
      }
    }, DELAYS[name]);
  });
  return { call, elapsed: () => Math.round(performance.now() - t0) };
}
