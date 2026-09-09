"use client";

import { useState } from "react";

// Верстка 1:1 з COMPONENTS.md (s_product → Gallery): "74px 1fr" грід, до 4
// вертикальних мініатюр (4-та показує "+N" при переповненні), головне фото
// aspect-ratio 4/5 з плаваючим лічильником "N / total" знизу справа.
//
// Реальних фото нема (як і в ProductCard) — плейсхолдери з тим самим
// diagonal-stripe патерном, тільки activeIndex перемикає "яке саме" фото
// показано зверху, щоб клік по мініатюрі відчувався по-справжньому.
export function ProductGallery({ imageCount, title }: { imageCount: number; title: string }) {
	const [active, setActive] = useState(0);
	const visibleThumbs = Math.min(imageCount, 4);
	const overflow = imageCount - visibleThumbs;

	return (
		<div className="grid grid-cols-[74px_1fr] gap-3">
			<div className="flex flex-col gap-[10px]">
				{Array.from({ length: visibleThumbs }).map((_, i) => {
					const isLast = i === visibleThumbs - 1;
					const showOverflow = isLast && overflow > 0;
					return (
						<button
							key={i}
							type="button"
							onClick={() => setActive(i)}
							aria-label={`Фото ${i + 1} з ${imageCount}`}
							className={`relative h-[92px] w-[74px] overflow-hidden rounded-control border bg-bg-muted transition-colors ${
								active === i
									? "border-[1.5px] border-accent"
									: "border-border hover:border-border-strong"
							}`}
							style={{
								backgroundImage:
									"repeating-linear-gradient(135deg, transparent 0 8px, rgba(127,127,127,.06) 8px 16px)",
							}}
						>
							{showOverflow && (
								<span className="absolute inset-0 flex items-center justify-center bg-black/55 font-mono text-[13px] font-semibold text-white">
									+{overflow}
								</span>
							)}
						</button>
					);
				})}
			</div>

			<div
				className="relative aspect-[4/5] overflow-hidden rounded-card border border-border bg-bg-muted"
				style={{
					backgroundImage:
						"repeating-linear-gradient(135deg, transparent 0 14px, rgba(127,127,127,.055) 14px 28px)",
				}}
			>
				<span className="absolute left-3 top-3 font-mono text-[10.5px] font-medium tracking-[0.08em] text-fg-subtle">
					{title}
				</span>
				<span className="absolute bottom-3 right-3 rounded-pill bg-black/60 px-2.5 py-1 font-mono text-[11px] font-medium text-white">
					{active + 1} / {imageCount}
				</span>
			</div>
		</div>
	);
}
