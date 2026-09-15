"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { formatUAH } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

// Qty-степер (46px, ширший за компактний 34px з Components) + CTA + wishlist.
// Епізод 7 — кнопка "Додати в кошик" стала реальною (useCart().addItem).
// Епізод 8 — фідбек про це тепер справжній toast (ToastContext), а не
// тимчасовий напис "Додано ✓" на самій кнопці з епізоду 7: кнопка знову
// завжди показує ціну, сповіщення живе своїм життям внизу праворуч і має
// "Скасувати" — реальний rollback до кількості, що була в кошику до кліку.
// wishlist лишається не-функціональним (епізод 9), той самий патерн,
// що й у ProductCard.
//
// "Оптимістичне оновлення" (епізод 7) нікуди не ділось — степер миттєво
// реагує на кожен клік без запиту на сервер, впирається у stock з підсвіткою.
export function BuyBoxActions({
	product,
}: {
	product: { slug: string; title: string; priceUAH: number; stock: number };
}) {
	const [qty, setQty] = useState(1);
	const [limitFlash, setLimitFlash] = useState(false);
	const { items, addItem, setQty: setCartQty, removeItem } = useCart();
	const { showToast } = useToast();

	function increment() {
		setQty((q) => {
			if (q >= product.stock) {
				setLimitFlash(true);
				setTimeout(() => setLimitFlash(false), 400);
				return q;
			}
			return q + 1;
		});
	}

	function handleAdd() {
		const previousQty = items.find((i) => i.slug === product.slug)?.qty ?? 0;
		addItem(product, qty);

		showToast({
			title: "Додано в кошик",
			subtitle: product.title,
			variant: "success",
			action: {
				label: "Скасувати",
				onClick: () => {
					if (previousQty > 0) {
						setCartQty(product.slug, previousQty);
					} else {
						removeItem(product.slug);
					}
				},
			},
		});
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-3">
				<div
					className={`flex h-[46px] items-center rounded-control border transition-colors ${
						limitFlash ? "border-danger" : "border-border"
					}`}
				>
					<button
						type="button"
						aria-label="Менше"
						onClick={() => setQty((q) => Math.max(1, q - 1))}
						className="grid h-full w-10 place-items-center text-fg-muted hover:text-fg"
					>
						−
					</button>
					<span className="grid h-full w-11 place-items-center border-x border-border font-mono text-[14px] font-semibold text-fg">
						{qty}
					</span>
					<button
						type="button"
						aria-label="Більше"
						onClick={increment}
						className="grid h-full w-10 place-items-center text-fg-muted hover:text-fg"
					>
						+
					</button>
				</div>

				{limitFlash && (
					<span className="font-mono text-[11.5px] font-medium text-danger">
						Максимум {product.stock} шт. в наявності
					</span>
				)}

				<button
					type="button"
					aria-label="Додати в обране"
					className="grid h-[46px] w-[46px] place-items-center rounded-control border border-border text-fg-muted hover:border-accent hover:text-accent"
				>
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
						<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
					</svg>
				</button>
			</div>

			<button type="button" onClick={handleAdd} className={buttonVariants({ size: "lg", className: "w-full" })}>
				Додати в кошик · {formatUAH(product.priceUAH * qty)}
			</button>
		</div>
	);
}
