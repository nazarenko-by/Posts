"use client";

import { useEffect, useState } from "react";
import type { Product } from "@prisma/client";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";

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

	if (displayProducts === null) {
		return <p className="text-fg-muted">Завантажуємо обране…</p>;
	}

	if (displayProducts.length === 0) {
		return <p className="text-fg-muted">Обране порожнє — постав ♡ на товарі, щоб він з&apos;явився тут.</p>;
	}

	return (
		<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
			{displayProducts.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
