// Ті самі три запити магазину на Drizzle + better-sqlite3.
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, desc, avg, count } from "drizzle-orm";
import * as schema from "./drizzle-schema";
import { product, review, order, orderItem } from "./drizzle-schema";
import { randomUUID } from "node:crypto";

export function open(file: string) {
    const db = drizzle(new Database(file), { schema });
    return {
        // каталог: 24 опубліковані товари, нові першими
        catalog: async () => db.select({ id: product.id, slug: product.slug, title: product.title, priceUAH: product.priceUAH,
            compareAt: product.compareAt, rating: product.rating, badge: product.badge, image: product.image })
            .from(product).where(eq(product.status, "PUBLISHED")).orderBy(desc(product.createdAt)).limit(24),
        // сторінка товару: товар + 10 останніх відгуків + середня оцінка
        productPage: async (slug: string) => {
            const p = await db.query.product.findFirst({ where: eq(product.slug, slug),
                with: { reviews: { orderBy: desc(review.createdAt), limit: 10 } } });
            const [agg] = await db.select({ avg: avg(review.rating), count: count() }).from(review).where(eq(review.productId, p!.id));
            return { p, avg: Number(agg.avg), count: agg.count };
        },
        // оформлення замовлення: наступний номер + замовлення + 2 позиції в одній транзакції
        createOrder: async () => db.transaction((tx) => {
            const last = tx.select({ seq: order.orderSeq }).from(order).orderBy(desc(order.orderSeq)).limit(1).get();
            const id = randomUUID();
            tx.insert(order).values({ id, orderSeq: (last?.seq ?? 0) + 1, firstName: "Богдан", lastName: "Н", email: "bench@nby.shop",
                phone: "+380501234567", city: "Харків", address: "Відділення №12", shipping: "nova_poshta", shippingCostUAH: 8000,
                payment: "card", totalUAH: 59700, createdAt: new Date() }).run();
            tx.insert(orderItem).values([
                { id: randomUUID(), orderId: id, productId: "p00001", productSlug: "product-1", title: "x", priceUAH: 19900, qty: 1 },
                { id: randomUUID(), orderId: id, productId: "p00007", productSlug: "product-7", title: "y", priceUAH: 19900, qty: 2 },
            ]).run();
            return id;
        }),
        close: async () => {},
    };
}
