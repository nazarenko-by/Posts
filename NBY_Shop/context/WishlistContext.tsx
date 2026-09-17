"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Епізод 9 — обране: клієнтський стан + persist, той самий lazy-init-з-
// localStorage підхід, що в CartContext (епізод 7) — SSR завжди отримує
// порожній набір, клієнт одразу після гідратації бачить реальний вибір,
// без спалаху.
//
// На відміну від кошика (епізод 7), запис тут НЕ дебаунситься: перемикання
// обраного — поодинокий клік, а не серія швидких змін (як набір ціни чи
// друк у пошуку), тож дебаунс нічого не рятує, лише додає затримку без
// потреби. Кожна серія — своя техніка, не "більше хуків заради хуків".
//
// Slug'и, не повні товари: сам вибір живе в localStorage (тільки клієнт),
// а дані про товари — у Prisma (тільки сервер). Сторінка /wishlist (нижче)
// зводить ці два світи через новий app/api/products — перший Route Handler
// у проєкті.

type WishlistContextValue = {
	slugs: string[];
	isWishlisted: (slug: string) => boolean;
	toggle: (slug: string) => void;
	count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "nby-wishlist";

function readStoredWishlist(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
	const [slugs, setSlugs] = useState<string[]>(readStoredWishlist);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
		} catch {
			// приватний режим / квота — обране лишається робочим у пам'яті цієї вкладки
		}
	}, [slugs]);

	function toggle(slug: string) {
		setSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
	}

	function isWishlisted(slug: string) {
		return slugs.includes(slug);
	}

	return (
		<WishlistContext.Provider value={{ slugs, isWishlisted, toggle, count: slugs.length }}>
			{children}
		</WishlistContext.Provider>
	);
}

export function useWishlist() {
	const ctx = useContext(WishlistContext);
	if (!ctx) {
		throw new Error("useWishlist має викликатись усередині <WishlistProvider>");
	}
	return ctx;
}
