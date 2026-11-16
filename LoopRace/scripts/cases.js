// Варіанти циклів. Дані: 1 000 000 рядків кошика { price, qty }.
// Дві задачі: sum - порахувати суму price * qty; totals - новий масив price * qty для кожного рядка.
export function makeData(n) {
    const a = new Array(n);
    for (let i = 0; i < n; i++) a[i] = { price: 100 + (i % 900), qty: 1 + (i % 5) };
    return a;
}

export const CASES = {
    sum: {
        for: (a) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i].price * a[i].qty; return s; },
        forOf: (a) => { let s = 0; for (const o of a) s += o.price * o.qty; return s; },
        forEach: (a) => { let s = 0; a.forEach((o) => { s += o.price * o.qty; }); return s; },
        reduce: (a) => a.reduce((s, o) => s + o.price * o.qty, 0),
    },
    totals: {
        for: (a) => { const r = []; for (let i = 0; i < a.length; i++) r.push(a[i].price * a[i].qty); return r; },
        forOf: (a) => { const r = []; for (const o of a) r.push(o.price * o.qty); return r; },
        forEach: (a) => { const r = []; a.forEach((o) => r.push(o.price * o.qty)); return r; },
        map: (a) => a.map((o) => o.price * o.qty),
    },
};
