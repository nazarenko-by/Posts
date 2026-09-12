"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

// Епізод 6 — категорії, ціновий діапазон і сортування. Верстка спрощена
// відносно "Sidebar filters" з дизайн-кіту (COMPONENTS.md:189 — 236px sticky
// сайдбар, slider + чекбокси, розмір, in-stock toggle, скидання): тут це
// горизонтальна панель над каталогом на головній, а не окрема /catalog
// сторінка з пагінацією — розмір/in-stock/слайдер лишаються поза скоупом
// епізоду. Категорійні pill-чипи — той самий патерн, що кіт показує на
// Home ("pill filter chips above", COMPONENTS.md:147).
//
// Ціна вводиться в ₴ (не копійках) — конвертація в копійки для Prisma
// відбувається на сервері (app/page.tsx). Дебаунс на цінових полях (300ms) —
// той самий useDebounce, що вже в ShopHeader (епізод 5): не штовхаємо
// новий URL/запит на кожну цифру, лише коли набір призупинився.

const SORT_OPTIONS = [
	{ value: "newest", label: "Спочатку нові" },
	{ value: "price_asc", label: "Дешевші спершу" },
	{ value: "price_desc", label: "Дорожчі спершу" },
	{ value: "rating_desc", label: "За рейтингом" },
] as const;

export type CategoryCount = { category: string; count: number };

export function CatalogFilters({
	categories,
	totalCount,
	priceBoundsUAH,
	activeCategory,
	sort,
	minPrice,
	maxPrice,
}: {
	categories: CategoryCount[];
	totalCount: number;
	priceBoundsUAH: { min: number; max: number };
	activeCategory?: string;
	sort: string;
	minPrice?: string;
	maxPrice?: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [minInput, setMinInput] = useState(minPrice ?? "");
	const [maxInput, setMaxInput] = useState(maxPrice ?? "");
	const debouncedMin = useDebounce(minInput, 300);
	const debouncedMax = useDebounce(maxInput, 300);

	function updateParams(updates: Record<string, string | undefined>) {
		const params = new URLSearchParams(searchParams.toString());
		for (const [key, value] of Object.entries(updates)) {
			if (value === undefined || value === "") {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}
		const query = params.toString();
		router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
	}

	// Пуш ціни в URL тільки після паузи в наборі — не на кожну цифру.
	useEffect(() => {
		if (debouncedMin !== (minPrice ?? "") || debouncedMax !== (maxPrice ?? "")) {
			updateParams({ minPrice: debouncedMin || undefined, maxPrice: debouncedMax || undefined });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedMin, debouncedMax]);

	const hasActiveFilters = Boolean(activeCategory || minPrice || maxPrice || (sort && sort !== "newest"));

	return (
		<div className="mb-8 flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={() => updateParams({ category: undefined })}
					className={
						!activeCategory
							? "rounded-full bg-fg px-3.5 py-[7px] font-mono text-[12px] font-medium text-bg"
							: "rounded-full border border-border px-3.5 py-[7px] font-mono text-[12px] font-medium text-fg-muted hover:border-border-strong hover:text-fg"
					}
				>
					Усі · {totalCount}
				</button>
				{categories.map((c) => (
					<button
						key={c.category}
						type="button"
						onClick={() =>
							updateParams({ category: activeCategory === c.category ? undefined : c.category })
						}
						className={
							activeCategory === c.category
								? "rounded-full bg-fg px-3.5 py-[7px] font-mono text-[12px] font-medium text-bg"
								: "rounded-full border border-border px-3.5 py-[7px] font-mono text-[12px] font-medium text-fg-muted hover:border-border-strong hover:text-fg"
						}
					>
						{c.category} · {c.count}
					</button>
				))}
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<span className="font-mono text-[11px] text-fg-subtle">₴</span>
					<input
						type="number"
						inputMode="numeric"
						min={0}
						value={minInput}
						onChange={(e) => setMinInput(e.target.value)}
						placeholder={String(priceBoundsUAH.min)}
						aria-label="Ціна від"
						className="h-9 w-[92px] rounded-control border border-border bg-bg-subtle px-2.5 font-mono text-[12.5px] text-fg outline-none focus:border-border-strong"
					/>
					<span className="text-fg-subtle">–</span>
					<input
						type="number"
						inputMode="numeric"
						min={0}
						value={maxInput}
						onChange={(e) => setMaxInput(e.target.value)}
						placeholder={String(priceBoundsUAH.max)}
						aria-label="Ціна до"
						className="h-9 w-[92px] rounded-control border border-border bg-bg-subtle px-2.5 font-mono text-[12.5px] text-fg outline-none focus:border-border-strong"
					/>
				</div>

				<select
					value={sort}
					onChange={(e) => updateParams({ sort: e.target.value === "newest" ? undefined : e.target.value })}
					aria-label="Сортування"
					className="h-9 rounded-control border border-border bg-bg-subtle px-2.5 font-mono text-[12.5px] text-fg outline-none focus:border-border-strong"
				>
					{SORT_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>

				{hasActiveFilters && (
					<button
						type="button"
						onClick={() => {
							setMinInput("");
							setMaxInput("");
							router.push(pathname, { scroll: false });
						}}
						className="font-mono text-[12px] font-medium text-fg-muted underline underline-offset-2 hover:text-fg"
					>
						Скинути фільтри
					</button>
				)}
			</div>
		</div>
	);
}
