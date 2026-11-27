// Дані для клонування - зі світу NBY Shop. Детерміновані, однакові для всіх способів.
const product = (i) => ({
    id: `p${i}`, slug: `product-${i}`, title: `Товар №${i}`, category: "hoodies", priceUAH: 199000 + i, compareAt: null,
    rating: 4.6, badge: "new", image: `/img/${i}.webp`, stock: 12, tags: ["merch", "dev"], specs: { size: ["S", "M", "L"], material: "cotton" },
});

export const CASES = {
    // 1. один товар - 12 полів, вкладені масиви й об'єкт
    product: () => product(1),
    // 2. кошик - замовлення з 50 позиціями
    cart: () => ({ id: "o1", city: "Харків", shipping: "nova_poshta", items: Array.from({ length: 50 }, (_, i) => ({ qty: 1 + (i % 3), product: product(i) })) }),
    // 3. каталог - 10 000 товарів
    catalog: () => ({ page: 1, items: Array.from({ length: 10_000 }, (_, i) => product(i)) }),
    // 4. стан з Date і Map - як у сторі
    rich: () => ({ updatedAt: new Date("2026-11-27T10:00:00Z"), byId: new Map(Array.from({ length: 50 }, (_, i) => [`p${i}`, product(i)])), seen: new Set(["p1", "p2"]) }),
    // 5. з циклом - дочірній вузол посилається на батька
    cycle: () => { const root = { name: "root", children: [] }; for (let i = 0; i < 20; i++) root.children.push({ name: `n${i}`, parent: root }); return root; },
};
