// Наповнення SQLite через Prisma 6: 2 000 товарів, 40 000 відгуків, 500 користувачів, 2 000 замовлень.
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const CATS = ["hoodies", "tshirts", "mugs", "stickers", "caps", "notebooks"];
const rnd = (n) => Math.floor(Math.random() * n);
let seed = 42; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const base = new Date("2026-01-01T00:00:00Z").getTime();
const products = Array.from({ length: 2000 }, (_, i) => ({
    id: `p${String(i).padStart(5, "0")}`, slug: `product-${i}`, title: `Товар №${i}`, category: CATS[i % CATS.length],
    priceUAH: 19900 + (i % 50) * 1000, compareAt: i % 4 === 0 ? 29900 : null, rating: 3 + (i % 20) / 10, badge: i % 7 === 0 ? "new" : null,
    image: `/img/${i}.webp`, description: "Опис товару ".repeat(8), specs: { size: ["S", "M", "L"], material: "cotton" },
    stock: i % 30, status: i % 10 === 0 ? "DRAFT" : "PUBLISHED", createdAt: new Date(base + i * 3600_000), updatedAt: new Date(base + i * 3600_000),
}));
await db.product.createMany({ data: products });
const reviews = [];
for (let i = 0; i < 2000; i++) for (let k = 0; k < 20; k++)
    reviews.push({ id: `r${i}_${k}`, productId: products[i].id, author: `Покупець ${k}`, rating: 1 + ((i + k) % 5),
        comment: "Класна річ, рекомендую. ".repeat(3), createdAt: new Date(base + i * 3600_000 + k * 60_000) });
for (let i = 0; i < reviews.length; i += 5000) await db.review.createMany({ data: reviews.slice(i, i + 5000) });
await db.user.createMany({ data: Array.from({ length: 500 }, (_, i) => ({ id: `u${i}`, email: `user${i}@nby.shop`, passwordHash: "x".repeat(60), name: `User ${i}` })) });
for (let i = 0; i < 2000; i++) {
    await db.order.create({ data: { id: `o${i}`, orderSeq: i + 1, userId: `u${i % 500}`, firstName: "Богдан", lastName: "Н", email: `user${i % 500}@nby.shop`,
        phone: "+380501234567", city: "Харків", address: "Відділення №12", shipping: "nova_poshta", shippingCostUAH: 8000, payment: "card",
        totalUAH: 59700, createdAt: new Date(base + i * 600_000),
        items: { create: [{ id: `oi${i}a`, productId: products[i % 2000].id, productSlug: products[i % 2000].slug, title: "x", priceUAH: 19900, qty: 1 },
                          { id: `oi${i}b`, productId: products[(i * 7) % 2000].id, productSlug: products[(i * 7) % 2000].slug, title: "y", priceUAH: 19900, qty: 2 }] } } });
}
console.log(await db.product.count(), await db.review.count(), await db.order.count());
await db.$disconnect();
