import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { CatalogFilters } from "@/components/CatalogFilters";

// Епізод 6 — категорії, ціновий діапазон, сортування. searchParams — той самий
// Promise-патерн, що вже в app/search/page.tsx (епізод 5): у Next 16 і params,
// і searchParams приходять асинхронно.
//
// Ціна в URL — у ₴ (людяно), у Prisma-запиті переводимо в копійки (×100) —
// правило "гроші завжди Int-копійки" з DESIGN_SYSTEM.md стосується збереження,
// не обов'язково відображення в query string.
type SearchParams = {
	category?: string;
	sort?: string;
	minPrice?: string;
	maxPrice?: string;
};

const SORT_MAP: Record<string, Prisma.ProductOrderByWithRelationInput> = {
	newest: { createdAt: "desc" },
	price_asc: { priceUAH: "asc" },
	price_desc: { priceUAH: "desc" },
	rating_desc: { rating: "desc" },
};

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const { category, sort = "newest", minPrice, maxPrice } = await searchParams;

	const where: Prisma.ProductWhereInput = { status: "PUBLISHED" };
	if (category) where.category = category;

	const minKopecks = minPrice ? Number(minPrice) * 100 : undefined;
	const maxKopecks = maxPrice ? Number(maxPrice) * 100 : undefined;
	if (minKopecks !== undefined || maxKopecks !== undefined) {
		where.priceUAH = {
			...(minKopecks !== undefined && !Number.isNaN(minKopecks) ? { gte: minKopecks } : {}),
			...(maxKopecks !== undefined && !Number.isNaN(maxKopecks) ? { lte: maxKopecks } : {}),
		};
	}

	// Категорії/лічильники і межі ціни рахуються з тих самих PUBLISHED товарів,
	// що йдуть у каталог — не хардкод-список, тож нова категорія з seed.ts
	// з'явиться в чипах сама, без ручного оновлення цього файлу.
	const [products, categoryGroups, priceAgg, totalCount] = await Promise.all([
		prisma.product.findMany({ where, orderBy: SORT_MAP[sort] ?? SORT_MAP.newest }),
		prisma.product.groupBy({
			by: ["category"],
			where: { status: "PUBLISHED" },
			_count: { _all: true },
			orderBy: { category: "asc" },
		}),
		prisma.product.aggregate({
			where: { status: "PUBLISHED" },
			_min: { priceUAH: true },
			_max: { priceUAH: true },
		}),
		prisma.product.count({ where: { status: "PUBLISHED" } }),
	]);

	const categories = categoryGroups.map((g) => ({ category: g.category, count: g._count._all }));
	const priceBoundsUAH = {
		min: Math.floor((priceAgg._min.priceUAH ?? 0) / 100),
		max: Math.ceil((priceAgg._max.priceUAH ?? 0) / 100),
	};

	return (
		<>
			<Hero />

			<section id="catalog" className="mx-auto max-w-6xl px-6 py-16">
				<h2 className="mb-8 text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-fg">Каталог</h2>

				<CatalogFilters
					categories={categories}
					totalCount={totalCount}
					priceBoundsUAH={priceBoundsUAH}
					activeCategory={category}
					sort={sort}
					minPrice={minPrice}
					maxPrice={maxPrice}
				/>

				{products.length === 0 ? (
					<p className="text-fg-muted">
						{totalCount === 0 ? (
							<>
								Товарів поки немає — запусти <code className="font-mono">npm run db:seed</code>.
							</>
						) : (
							"Товарів за цими фільтрами немає — спробуй скинути фільтри."
						)}
					</p>
				) : (
					<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
						{products.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</section>
		</>
	);
}
