"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useDebounce } from "@/hooks/useDebounce";

// Епізод 7 — клієнтський кошик: стан у пам'яті (React state), persist у
// localStorage, оптимістичне оновлення. Без /cart сторінки й без toast —
// це епізоди 189 (toast "додано в кошик") і пізніше; тут лічильник у шапці
// й сама можливість додати товар.
//
// "Оптимістичне" тут буквально: UI (лічильник у шапці, qty-степер) оновлюється
// миттєво на кожен dispatch, а сам запис на диск не блокує інтерфейс і не
// летить на кожен клік поспіль — дебаунситься (той самий useDebounce, що вже
// в пошуку й фільтрах). Інтерфейс не чекає на persist, persist наздоганяє
// інтерфейс.
//
// Початковий стан читається з localStorage лениво (lazy useState initializer),
// а не через useEffect+HYDRATE: на сервері localStorage нема, тож SSR завжди
// віддає []; на клієнті lazy-initializer виконується під час гідратації і
// одразу дає реальні дані без "спалаху" 0 → N. Лічильник у шапці свідомо
// suppressHydrationWarning — той самий випадок, що next-themes у епізоді 3:
// клієнтська правда законно відрізняється від SSR-заглушки.

export type CartItem = {
	slug: string;
	title: string;
	priceUAH: number;
	qty: number;
};

type AddableProduct = {
	slug: string;
	title: string;
	priceUAH: number;
	stock: number;
};

type CartContextValue = {
	items: CartItem[];
	totalCount: number;
	totalUAH: number;
	addItem: (product: AddableProduct, qty: number) => void;
	removeItem: (slug: string) => void;
	setQty: (slug: string, qty: number) => void;
	clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nby-cart";

function readStoredCart(): CartItem[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartItem[]) : [];
	} catch {
		return [];
	}
}

export function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>(readStoredCart);

	// 400ms — той самий проміжок, що й у пошуку/фільтрах (епізоди 5-6):
	// швидкі клацання "+" не пишуть у localStorage на кожен клік.
	const debouncedItems = useDebounce(items, 400);
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedItems));
		} catch {
			// приватний режим / переповнена квота — кошик лишається робочим у пам'яті,
			// просто не переживе перезавантаження сторінки.
		}
	}, [debouncedItems]);

	function addItem(product: AddableProduct, qty: number) {
		setItems((prev) => {
			const existing = prev.find((i) => i.slug === product.slug);
			const nextQty = Math.min((existing?.qty ?? 0) + qty, product.stock);
			if (existing) {
				return prev.map((i) => (i.slug === product.slug ? { ...i, qty: nextQty } : i));
			}
			return [...prev, { slug: product.slug, title: product.title, priceUAH: product.priceUAH, qty: nextQty }];
		});
	}

	function removeItem(slug: string) {
		setItems((prev) => prev.filter((i) => i.slug !== slug));
	}

	function setQty(slug: string, qty: number) {
		setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, qty) } : i)));
	}

	function clear() {
		setItems([]);
	}

	const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
	const totalUAH = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.priceUAH, 0), [items]);

	return (
		<CartContext.Provider value={{ items, totalCount, totalUAH, addItem, removeItem, setQty, clear }}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) {
		throw new Error("useCart має викликатись усередині <CartProvider>");
	}
	return ctx;
}
