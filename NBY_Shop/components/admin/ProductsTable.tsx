"use client";

import { useState, useTransition } from "react";
import type { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { formatUAH } from "@/lib/format";
import { deleteProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";

// Епізод 15 — таблиця товарів з кіту (COMPONENTS.md → s_admin), точна сітка
// колонок: 28px 1fr 108px 92px 74px 96px 34px (чекбокс / товар / категорія /
// ціна / залишок / статус / kebab-меню). Kebab — власне мінімальне меню
// (useState на id відкритого рядка), без нової залежності — той самий підхід,
// що cmdk у пості 193: підключаємо бібліотеку лише коли вона щось реально
// вирішує, тут вистачає 2 пунктів (Редагувати/Видалити).
const GRID_COLS = "28px 1fr 108px 92px 74px 96px 34px";

function StatusBadge({ status }: { status: Product["status"] }) {
	if (status === "DRAFT") {
		return (
			<span className="w-fit rounded-[6px] border border-border px-2 py-1 font-mono text-[10px] font-semibold uppercase text-fg-subtle">
				чернетка
			</span>
		);
	}
	return (
		<span className="w-fit rounded-[6px] bg-ok-subtle px-2 py-1 font-mono text-[10px] font-semibold uppercase text-ok">
			live
		</span>
	);
}

function StockCell({ stock }: { stock: number }) {
	if (stock === 0) return <span className="font-mono text-[12.5px] text-danger">0</span>;
	if (stock <= 3) return <span className="font-mono text-[12.5px] text-warn">{stock}</span>;
	return <span className="font-mono text-[12.5px] text-fg">{stock}</span>;
}

export function ProductsTable({ products, categories }: { products: Product[]; categories: string[] }) {
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);
	const [editing, setEditing] = useState<Product | null | "new">(null);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function handleDelete(product: Product) {
		setOpenMenuId(null);
		if (!window.confirm(`Видалити «${product.title}»? Дію не можна скасувати.`)) return;

		startTransition(async () => {
			const result = await deleteProduct(product.id);
			if (!result.success) setError(result.message);
		});
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				{error && <p className="text-[12px] text-danger">{error}</p>}
				<Button className="ml-auto" onClick={() => setEditing("new")}>
					+ Новий товар
				</Button>
			</div>

			<div className="rounded-card border border-border">
				<div
					className="grid items-center gap-3 border-b border-border px-4.5 py-2.5 font-mono text-[10.5px] uppercase tracking-[.09em] text-fg-subtle"
					style={{ gridTemplateColumns: GRID_COLS }}
				>
					<span />
					<span>товар</span>
					<span>категорія</span>
					<span>ціна</span>
					<span>залишок</span>
					<span>статус</span>
					<span />
				</div>

				{products.length === 0 ? (
					<p className="px-4.5 py-8 text-center text-[13px] text-fg-muted">Товарів поки нема.</p>
				) : (
					products.map((product) => (
						<div
							key={product.id}
							className="relative grid items-center gap-3 border-b border-border px-4.5 py-3 last:border-b-0"
							style={{ gridTemplateColumns: GRID_COLS }}
						>
							<span className="h-3.5 w-3.5 rounded-[4px] border border-border-strong" />
							<span className="flex min-w-0 items-center gap-2.5">
								<span className="h-10 w-[34px] flex-none rounded-[6px] border border-border bg-bg-muted" />
								<span className="flex min-w-0 flex-col gap-0.5">
									<span className="truncate text-[12.5px] font-medium text-fg">{product.title}</span>
									<span className="truncate font-mono text-[10.5px] text-fg-subtle">
										/{product.slug}
									</span>
								</span>
							</span>
							<span className="truncate text-[12px] text-fg-muted">{product.category}</span>
							<span className="font-mono text-[12.5px] font-semibold text-fg">
								{formatUAH(product.priceUAH)}
							</span>
							<StockCell stock={product.stock} />
							<StatusBadge status={product.status} />

							<span className="relative text-center">
								<button
									type="button"
									onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
									className="cursor-pointer font-sans text-[14px] font-semibold leading-none text-fg-subtle"
									aria-label="Дії з товаром"
								>
									⋯
								</button>

								{openMenuId === product.id && (
									<div className="absolute right-0 top-6 z-10 flex w-36 flex-col overflow-hidden rounded-control border border-border bg-bg shadow-lg">
										<button
											type="button"
											onClick={() => {
												setEditing(product);
												setOpenMenuId(null);
											}}
											className="cursor-pointer px-3 py-2 text-left text-[12.5px] text-fg hover:bg-bg-muted"
										>
											Редагувати
										</button>
										<button
											type="button"
											disabled={isPending}
											onClick={() => handleDelete(product)}
											className="cursor-pointer px-3 py-2 text-left text-[12.5px] text-danger hover:bg-danger-subtle disabled:opacity-50"
										>
											Видалити
										</button>
									</div>
								)}
							</span>
						</div>
					))
				)}
			</div>

			<span className="font-mono text-[11px] text-fg-subtle">
				{products.length} {products.length === 1 ? "товар" : "товарів"}
			</span>

			{editing && (
				<ProductForm
					product={editing === "new" ? null : editing}
					categories={categories}
					onClose={() => setEditing(null)}
				/>
			)}
		</div>
	);
}
