// Ті самі три запити магазину на Prisma (код однаковий для Prisma 6 і 7, відрізняється лише створення клієнта).
import { randomUUID } from "node:crypto";

export function queries(db: any) {
    return {
        catalog: () => db.product.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 24,
            select: { id: true, slug: true, title: true, priceUAH: true, compareAt: true, rating: true, badge: true, image: true } }),
        productPage: async (slug: string) => {
            const p = await db.product.findUnique({ where: { slug }, include: { reviews: { orderBy: { createdAt: "desc" }, take: 10 } } });
            const agg = await db.review.aggregate({ where: { productId: p.id }, _avg: { rating: true }, _count: true });
            return { p, avg: agg._avg.rating, count: agg._count };
        },
        createOrder: () => db.$transaction(async (tx: any) => {
            const last = await tx.order.findFirst({ orderBy: { orderSeq: "desc" }, select: { orderSeq: true } });
            const id = randomUUID();
            await tx.order.create({ data: { id, orderSeq: (last?.orderSeq ?? 0) + 1, firstName: "Богдан", lastName: "Н", email: "bench@nby.shop",
                phone: "+380501234567", city: "Харків", address: "Відділення №12", shipping: "nova_poshta", shippingCostUAH: 8000,
                payment: "card", totalUAH: 59700,
                items: { create: [
                    { id: randomUUID(), productId: "p00001", productSlug: "product-1", title: "x", priceUAH: 19900, qty: 1 },
                    { id: randomUUID(), productId: "p00007", productSlug: "product-7", title: "y", priceUAH: 19900, qty: 2 },
                ] } } });
            return id;
        }),
        close: () => db.$disconnect(),
    };
}
