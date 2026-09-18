import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatUAH } from "@/lib/format";
import { getProductReviewStats } from "@/lib/reviews";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductTabs } from "@/components/ProductTabs";
import { BuyBoxActions } from "@/components/BuyBoxActions";
import { RatingStars } from "@/components/RatingStars";
import { ReviewsSection } from "@/components/ReviewsSection";

// ISR: сторінка генерується статично на build (generateStaticParams нижче),
// і Next.js ревалідовує її раз на 60с — товар оновиться (ціна/stock) без
// повного передеплою, але без ціни фул client-side fetch на кожен візит.
export const revalidate = 60;

// generateStaticParams будує сторінку для кожного slug ще на build-етапі —
// перший відвідувач будь-якого товару отримує вже готовий HTML, не чекає
// рендер "на льоту".
export async function generateStaticParams() {
	const products = await prisma.product.findMany({
		where: { status: "PUBLISHED" },
		select: { slug: true },
	});
	return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const product = await prisma.product.findUnique({ where: { slug } });

	// DRAFT-товари й неіснуючі slug'и — 404, а не "тиха" порожня сторінка.
	if (!product || product.status !== "PUBLISHED") {
		notFound();
	}

	const specs = (product.specs as Record<string, string> | null) ?? null;

	// Епізод 10: рейтинг у буй-боксі — тепер живий _avg з Review, не Product.rating
	// напряму. Фолбек на кешоване число лишається, поки в товару ще нема відгуків
	// (напр. усі товари крім кількох, які засіяні в prisma/seed.ts).
	const [stats, reviews] = await Promise.all([
		getProductReviewStats(product.id),
		prisma.review.findMany({
			where: { productId: product.id },
			orderBy: { createdAt: "desc" },
			take: 6,
		}),
	]);
	const displayRating = stats.count > 0 ? stats.average! : product.rating;

	return (
		<>
			<div className="mx-auto max-w-6xl px-6 py-10">
				<nav className="mb-6 flex items-center gap-2 font-mono text-[12px] text-fg-subtle">
					<Link href="/" className="hover:text-fg">
						Головна
					</Link>
					<span>/</span>
					<span>{product.category}</span>
					<span>/</span>
					<span className="text-fg-muted">{product.title}</span>
				</nav>

				<div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-[52px]">
					<ProductGallery imageCount={product.imageCount} title={product.title} />

					<div className="flex flex-col gap-5">
						<div className="flex items-center gap-2">
							<span className="font-mono text-[11px] font-medium uppercase tracking-[0.09em] text-fg-subtle">
								{product.category}
							</span>
							{product.stock > 0 ? (
								<span className="rounded-badge bg-ok-subtle px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-ok">
									в наявності
								</span>
							) : (
								<span className="rounded-badge bg-danger-subtle px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-danger">
									немає в наявності
								</span>
							)}
						</div>

						<h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.03em] text-fg">
							{product.title}
						</h1>

						<a href="#reviews" className="flex items-center gap-1.5 font-mono text-[13px] text-fg-muted">
							<RatingStars rating={displayRating} size={13} />
							{displayRating.toFixed(1)}
							{stats.count > 0 && <span className="text-fg-subtle">· {stats.count}</span>}
						</a>

						<div className="flex items-baseline gap-3">
							<span className="font-mono text-[30px] font-semibold tabular-nums text-fg">
								{formatUAH(product.priceUAH)}
							</span>
							{product.compareAt && (
								<>
									<span className="font-mono text-[16px] text-fg-subtle line-through">
										{formatUAH(product.compareAt)}
									</span>
									<span className="rounded-badge bg-accent-subtle px-[9px] py-1 font-mono text-[11px] font-semibold text-accent">
										−{formatUAH(product.compareAt - product.priceUAH)}
									</span>
								</>
							)}
						</div>

						<BuyBoxActions
							product={{
								slug: product.slug,
								title: product.title,
								priceUAH: product.priceUAH,
								stock: product.stock,
							}}
						/>

						<div className="flex flex-col gap-2 rounded-card bg-bg-subtle p-4 text-[12.5px] text-fg-muted">
							<span>🚚 Доставка 1–2 дні по Україні</span>
							<span>🛡️ Гарантія виробника 12 місяців</span>
							<span>↩️ Повернення протягом 14 днів</span>
						</div>

						<div className="pt-2">
							<ProductTabs description={product.description} specs={specs} reviewCount={stats.count} />
						</div>
					</div>
				</div>
			</div>

			<ReviewsSection
				average={displayRating}
				count={stats.count}
				recommend={stats.recommend}
				distribution={stats.distribution}
				reviews={reviews}
			/>
		</>
	);
}
