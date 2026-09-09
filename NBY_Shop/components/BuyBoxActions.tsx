"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { formatUAH } from "@/lib/format";

// Qty-степер (46px, ширший за компактний 34px з Components) + CTA + wishlist.
// Кнопка "Додати в кошик" поки без onClick — кошик реальний в епізоді 7,
// wishlist — епізод 9 (той самий не-функціональний патерн, що й у ProductCard).
export function BuyBoxActions({ priceUAH }: { priceUAH: number }) {
	const [qty, setQty] = useState(1);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-3">
				<div className="flex h-[46px] items-center rounded-control border border-border">
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
						onClick={() => setQty((q) => q + 1)}
						className="grid h-full w-10 place-items-center text-fg-muted hover:text-fg"
					>
						+
					</button>
				</div>

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

			<button type="button" className={buttonVariants({ size: "lg", className: "w-full" })}>
				Додати в кошик · {formatUAH(priceUAH * qty)}
			</button>
		</div>
	);
}
