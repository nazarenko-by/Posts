import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Епізод 17 — generateMetadata() і сам компонент сторінки (app/product/
// [slug]/page.tsx) раніше кожен робив свій prisma.product.findUnique за тим
// самим slug — Next.js рендерить їх окремо, Prisma-клієнт сам не дедуплікує
// однакові запити. React cache() кешує результат на час одного рендеру
// (per-request), тож другий виклик з тим самим slug повертає вже готовий
// проміс, а не новий SQL-запит. opengraph-image.tsx (нижче) теж викликає цю
// саму функцію — для нього це окремий HTTP-запит (файлова конвенція Next.js
// рендерить OG-картинку як власний route), тому там кешування не рятує, але
// код лишається одним джерелом правди замість третьої копії findUnique.
export const getProductBySlug = cache(async (slug: string) => {
	return prisma.product.findUnique({ where: { slug } });
});
