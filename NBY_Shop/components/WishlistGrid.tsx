"use client";

import { useEffect, useState } from "react";
import type { Product } from "@prisma/client";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { EmptyState, HeartOffIcon } from "@/components/EmptyState";

// Клієнтський компонент навмисно: WishlistContext (localStorage) читається
// лише на клієнті, тож і похід по товари за цими slug'ами — теж клієнтський
// fetch до нового /api/products, а не прямий Prisma-запит у Server Component
// (як усюди досі в проєкті). Це перша сторінка серії, де дані приходять не
// напряму з сервера в першому HTML-кадрі — свідомий виняток, а не відхід
// від правила.
export function WishlistGrid() {
	const { slugs } = useWishlist();
	const [products, setProducts] = useState<Product[] | null>(null);

	// Порожній wishlist не потребує запиту — рахуємо це прямо в рендері
	// (displayProducts), а не синхронним setState() у тілі ефекту: React
	// (react-hooks/set-state-in-effect) вважає це кандидатом на каскадні
	// ре-рендери. Ефект лише підписується на fetch і виставляє стан
	// асинхронно, у .then() — так само, як cascading-safe патерн уже
	// закріплений через resolvedTheme у ThemeToggle (епізод 3).
	useEffect(() => {
		if (slugs.length === 0) return;

		let cancelled = false;
		fetch(`/api/products?slugs=${encodeURIComponent(slugs.join(","))}`)
			.then((res) => res.json())
			.then((data: { products: Product[] }) => {
				if (!cancelled) setProducts(data.products);
			});

		return () => {
			cancelled = true;
		};
	}, [slugs]);

	const displayProducts = slugs.length === 0 ? [] : products;

	// Епізод 16 — реальний skeleton замість тексту "Завантажуємо обране…":
	// той самий компонент, що app/loading.tsx (ProductGridSkeleton), клієнтський
	// виклик тут не потребує loading.tsx-файлу (це не Suspense-межа роута), тож
	// skeleton рендериться прямо в гілці стану.
	if (displayProducts === null) {
		return <ProductGridSkeleton count={4} />;
	}

	if (displayProducts.length === 0) {
		return (
			<EmptyState
				icon={<HeartOffIcon />}
				title="Обране порожнє"
				description="Постав ♡ на товарі в каталозі, щоб він з'явився тут."
				actions={
					<Link
						href="/"
						className="inline-flex h-9 items-center rounded-control bg-fg px-4 font-mono text-[12.5px] font-medium text-bg no-underline"
					>
						До каталогу
					</Link>
				}
				caption="/wishlist · empty"
			/>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
			{displayProducts.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
