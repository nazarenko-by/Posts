import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";

// Async Server Component — жодного useEffect/useState, жодного /api/products.
// Next.js рендерить цю сторінку на сервері, дані вже готові в першому HTML-кадрі.
// Header/Footer тепер живуть у app/layout.tsx (епізод 2) — тут Hero + каталог.
export default async function HomePage() {
	const products = await prisma.product.findMany({
		where: { status: "PUBLISHED" },
		orderBy: { createdAt: "desc" },
	});

	return (
		<>
			<Hero />

			<section id="catalog" className="mx-auto max-w-6xl px-6 py-16">
				<h2 className="mb-8 text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-fg">Каталог</h2>

				{products.length === 0 ? (
					<p className="text-fg-muted">
						Товарів поки немає — запусти <code className="font-mono">npm run db:seed</code>.
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
