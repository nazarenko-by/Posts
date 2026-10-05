import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// Епізод 17 — sitemap.ts, файлова конвенція Next.js: автоматично віддається
// на /sitemap.xml, типізовано через MetadataRoute.Sitemap. Статичні роути —
// лише ті, що реально індексовані (app/page.tsx без robots-override); решта
// (auth/account/checkout/wishlist/search/admin) мають robots: noindex у
// власних metadata, їм тут не місце. lastModified товару — product.updatedAt
// (реальна дата останньої зміни, не Date.now() — інакше Google бачив би
// "оновлено щойно" на кожному crawl, що знецінює сам сигнал).
const BASE_URL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const products = await prisma.product.findMany({
		where: { status: "PUBLISHED" },
		select: { slug: true, updatedAt: true },
	});

	const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
		url: `${BASE_URL}/product/${product.slug}`,
		lastModified: product.updatedAt,
		changeFrequency: "weekly",
		priority: 0.8,
	}));

	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		...productEntries,
	];
}
