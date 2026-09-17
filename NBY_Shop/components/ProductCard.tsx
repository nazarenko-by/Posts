"use client";

import Link from "next/link";
import type { Product } from "@prisma/client";
import { formatUAH } from "@/lib/format";
import { useWishlist } from "@/context/WishlistContext";

// Верстка 1:1 з дизайн-кіту (ShopProject/COMPONENTS.md → ProductCard.dc.html),
// перекладена з inline-стилів на Tailwind-класи, що читають наші токени
// (bg-muted, border, text-fg-muted, rounded-card...) з app/globals.css.
// Епізод 9 — wishlist-кнопка тепер реальна (useWishlist().toggle), заповнене
// серце — товар в обраному. Компонент став "use client" саме через це:
// раніше рендерився і на сервері (звичайний Server Component), контекст
// обраного це змінює.
//
// Картка веде на /product/[slug] — епізод 4 (динамічний route + галерея).
// Link — абсолютний оверлей на всю картку, а не обгортка навколо wishlist-
// кнопки: <button> усередині <a> — невалідна вкладеність (interactive-in-
// interactive), тож кнопка лишається сусідом з вищим z-index і перехоплює клік.

export function ProductCard({ product }: { product: Product }) {
	const { isWishlisted, toggle } = useWishlist();
	const wishlisted = isWishlisted(product.slug);

	return (
		<div className="group relative flex flex-col gap-3">
			<Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.title} />

			<div
				className="relative z-20 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-card border border-border bg-bg-muted transition-colors group-hover:border-border-strong"
				style={{
					backgroundImage:
						"repeating-linear-gradient(135deg, transparent 0 11px, rgba(127,127,127,.055) 11px 22px)",
				}}
			>
				<span className="pointer-events-none font-mono text-[10.5px] font-medium tracking-[0.08em] text-fg-subtle">
					IMG 4:5
				</span>

				{product.badge && (
					<span className="pointer-events-none absolute left-2.5 top-2.5 rounded-badge bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-fg">
						{product.badge}
					</span>
				)}

				<button
					type="button"
					aria-label={wishlisted ? "Прибрати з обраного" : "Додати в обране"}
					aria-pressed={wishlisted}
					onClick={() => toggle(product.slug)}
					suppressHydrationWarning
					className={`relative z-30 absolute right-2 top-2 grid h-[30px] w-[30px] place-items-center rounded-control border transition-colors ${
						wishlisted
							? "border-accent bg-accent-subtle text-accent"
							: "border-border bg-bg text-fg-muted hover:border-accent hover:text-accent"
					}`}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill={wishlisted ? "currentColor" : "none"}
						stroke="currentColor"
						strokeWidth="2"
						suppressHydrationWarning
					>
						<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
					</svg>
				</button>
			</div>

			<div className="pointer-events-none flex flex-col gap-[5px]">
				<span className="font-mono text-[10px] font-medium uppercase tracking-[0.09em] text-fg-subtle">
					{product.category}
				</span>
				<span className="text-[14.5px] font-medium leading-[1.35] tracking-[-0.01em] text-fg">
					{product.title}
				</span>
				<div className="mt-[3px] flex items-center gap-2">
					<span className="font-mono text-sm font-semibold text-fg">{formatUAH(product.priceUAH)}</span>
					{product.compareAt && (
						<span className="font-mono text-[12.5px] text-fg-subtle line-through">
							{formatUAH(product.compareAt)}
						</span>
					)}
					<span className="flex-1" />
					<span className="flex items-center gap-[3px] font-mono text-[11.5px] font-medium text-fg-muted">
						<svg width="11" height="11" viewBox="0 0 24 24" fill="var(--color-star)" stroke="none">
							<path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7-6.2-3.5L5.8 21l1.4-7L2 9.4l7-.8z" />
						</svg>
						{product.rating.toFixed(1)}
					</span>
				</div>
			</div>
		</div>
	);
}
