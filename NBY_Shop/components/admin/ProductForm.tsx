"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { Product } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slugify";
import { createProduct, updateProduct } from "@/app/admin/actions";
import type { ProductFormState } from "@/lib/product-schema";

// Епізод 15 — слайд-овер "Новий товар" з кіту (COMPONENTS.md → s_admin),
// порядок полів 1:1: Title → Slug (readonly) → (Category, Stock) → (Price,
// Old price) → Description → Photos/dropzone → Publish toggle → Save/Cancel.
// Photos — декоративний dropzone (немає реального файл-сховища, той самий
// принцип, що "зберегти картку" в CheckoutForm.tsx і бонус-картка в /account):
// нові товари отримують заглушку-зображення на сервері (app/admin/actions.ts).
const initialState: ProductFormState = { success: false };

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="mt-1 text-[11.5px] text-danger">{message}</p>;
}

export function ProductForm({
	product,
	categories,
	onClose,
}: {
	product: Product | null;
	categories: string[];
	onClose: () => void;
}) {
	const isEdit = Boolean(product);
	const action = isEdit ? updateProduct.bind(null, product!.id) : createProduct;
	const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, initialState);

	const [title, setTitle] = useState(product?.title ?? "");
	const slugPreview = useMemo(() => slugify(title) || "tovar", [title]);

	// Той самий урок, що WishlistGrid (епізод 9) і PaymentDeclinedModal (епізод
	// 12): закриття за станом сервера йде в ефекті, не прямо в тілі рендера —
	// useActionState повертає новий об'єкт на кожен сабміт, порівнюємо
	// state.success, а не ставимо стан під час рендера.
	useEffect(() => {
		if (state.success) onClose();
	}, [state.success, onClose]);

	return (
		<div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
			<div
				className="flex h-full w-full max-w-[420px] flex-col bg-bg shadow-lg"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="border-b border-border px-5 py-4">
					<h2 className="text-[15px] font-semibold text-fg">{isEdit ? "Редагувати товар" : "Новий товар"}</h2>
					<p className="mt-0.5 font-mono text-[10.5px] text-fg-subtle">
						{isEdit ? `PATCH /api/products/${product!.id}` : "POST /api/products"}
					</p>
				</div>

				<form action={formAction} className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4.5">
					<label className="flex flex-col gap-1.5">
						<span className="text-[12.5px] font-medium text-fg">Назва товару *</span>
						<input
							name="title"
							defaultValue={product?.title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Худі «Dark Mode Only»"
							className="h-10 rounded-control border border-border bg-bg px-3 text-[13px] text-fg"
						/>
						<FieldError message={state.errors?.title?.[0]} />
					</label>

					<label className="flex flex-col gap-1.5">
						<span className="text-[12.5px] font-medium text-fg">Слаг</span>
						<span className="rounded-control bg-bg-subtle px-3 py-2.5 font-mono text-[12.5px] text-fg-subtle">
							/{isEdit && title === product?.title ? product?.slug : slugPreview}
						</span>
					</label>

					<div className="grid grid-cols-2 gap-3">
						<label className="flex flex-col gap-1.5">
							<span className="text-[12.5px] font-medium text-fg">Категорія</span>
							<input
								name="category"
								defaultValue={product?.category}
								list="admin-categories"
								placeholder="Одяг"
								className="h-10 rounded-control border border-border bg-bg px-3 text-[13px] text-fg"
							/>
							<datalist id="admin-categories">
								{categories.map((c) => (
									<option key={c} value={c} />
								))}
							</datalist>
							<FieldError message={state.errors?.category?.[0]} />
						</label>

						<label className="flex flex-col gap-1.5">
							<span className="text-[12.5px] font-medium text-fg">Залишок</span>
							<input
								name="stock"
								type="number"
								min={0}
								defaultValue={product?.stock ?? 0}
								className="h-10 rounded-control border border-border bg-bg px-3 font-mono text-[13px] text-fg"
							/>
							<FieldError message={state.errors?.stock?.[0]} />
						</label>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<label className="flex flex-col gap-1.5">
							<span className="text-[12.5px] font-medium text-fg">Ціна, ₴ *</span>
							<input
								name="priceUAH"
								type="number"
								min={1}
								defaultValue={product ? Math.round(product.priceUAH / 100) : undefined}
								placeholder="2190"
								className="h-10 rounded-control border border-border bg-bg px-3 font-mono text-[13px] text-fg"
							/>
							<FieldError message={state.errors?.priceUAH?.[0]} />
						</label>

						<label className="flex flex-col gap-1.5">
							<span className="text-[12.5px] font-medium text-fg">Стара ціна, ₴</span>
							<input
								name="compareAtUAH"
								type="number"
								min={1}
								defaultValue={product?.compareAt ? Math.round(product.compareAt / 100) : undefined}
								placeholder="—"
								className="h-10 rounded-control border border-border bg-bg px-3 font-mono text-[13px] text-fg"
							/>
							<FieldError message={state.errors?.compareAtUAH?.[0]} />
						</label>
					</div>

					<label className="flex flex-col gap-1.5">
						<span className="text-[12.5px] font-medium text-fg">Опис</span>
						<textarea
							name="description"
							defaultValue={product?.description ?? ""}
							rows={3}
							className="rounded-control border border-border bg-bg px-3 py-2 text-[13px] text-fg"
						/>
					</label>

					<div>
						<span className="text-[12.5px] font-medium text-fg">Фото</span>
						<div className="mt-1.5 flex items-center gap-2">
							<span className="h-[66px] w-[56px] rounded-[6px] border border-border bg-bg-muted" />
							<div
								className="flex h-[66px] flex-1 cursor-not-allowed items-center justify-center rounded-[6px] border border-dashed border-border-strong text-center text-[10.5px] leading-tight text-fg-subtle"
								title="Немає реального файл-сховища в цьому демо — товар отримує заглушку-зображення"
							>
								перетягніть
								<br />
								або оберіть
							</div>
						</div>
					</div>

					<label className="flex items-center justify-between rounded-control bg-bg-subtle px-3 py-2.5">
						<span className="text-[12.5px] font-medium text-fg">Опубліковано</span>
						<input
							name="published"
							type="checkbox"
							defaultChecked={product?.status === "PUBLISHED"}
							className="h-4 w-4 accent-accent"
						/>
					</label>

					{state.message && !state.success && <p className="text-[11.5px] text-danger">{state.message}</p>}

					<div className="mt-auto flex gap-2 border-t border-border pt-4">
						<Button type="submit" disabled={pending}>
							{pending ? "Зберігаємо…" : "Зберегти"}
						</Button>
						<Button type="button" variant="secondary" onClick={onClose}>
							Скасувати
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
