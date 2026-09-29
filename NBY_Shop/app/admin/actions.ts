"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";
import { productSchema, type ProductFormState } from "@/lib/product-schema";

// Епізод 15 — той самий контракт, що submitCheckout (епізод 11): safeParse →
// повертає помилки по полях або success, useActionState на клієнті.
//
// Слаг рахується на сервері з назви (клієнт лише показує readonly-прев'ю,
// lib/slugify.ts) — і тут же, а не в схемі, бо перевірка унікальності вимагає
// походу в БД. Колізія ("dve-hudi" вже існує) вирішується числовим суфіксом,
// той самий підхід, що autoincrement orderSeq: не намагаємось вгадати вільний
// слаг заздалегідь, а перевіряємо й донабираємо.
async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
	const base = slugify(title) || "tovar";
	let candidate = base;
	let suffix = 1;

	while (true) {
		const existing = await prisma.product.findUnique({ where: { slug: candidate } });
		if (!existing || existing.id === excludeId) return candidate;
		suffix += 1;
		candidate = `${base}-${suffix}`;
	}
}

function revalidateShop() {
	revalidatePath("/admin/products");
	revalidatePath("/"); // каталог фільтрує по status — публікація мусить бути видно одразу
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
	await requireAdmin();

	const parsed = productSchema.safeParse({
		title: formData.get("title"),
		category: formData.get("category"),
		priceUAH: formData.get("priceUAH"),
		compareAtUAH: formData.get("compareAtUAH"),
		stock: formData.get("stock"),
		description: formData.get("description"),
		published: formData.get("published") === "on",
	});

	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Перевір поля форми." };
	}

	const { title, category, priceUAH, compareAtUAH, stock, description, published } = parsed.data;
	const slug = await uniqueSlug(title);

	await prisma.product.create({
		data: {
			slug,
			title,
			category,
			// UI віддає ₴, у Prisma — завжди Int-копійки (DESIGN_SYSTEM.md).
			priceUAH: priceUAH * 100,
			compareAt: compareAtUAH ? compareAtUAH * 100 : null,
			stock,
			description,
			status: published ? "PUBLISHED" : "DRAFT",
			// Реального завантаження фото нема (епізод 15 — форма, не файл-сховище);
			// той самий принцип чесності, що декоративний dropzone у слайд-овері.
			image: "/products/placeholder.jpg",
			imageCount: 1,
		},
	});

	revalidateShop();
	return { success: true, message: `Товар «${title}» створено (/${slug}).` };
}

export async function updateProduct(
	id: string,
	_prev: ProductFormState,
	formData: FormData
): Promise<ProductFormState> {
	await requireAdmin();

	const parsed = productSchema.safeParse({
		title: formData.get("title"),
		category: formData.get("category"),
		priceUAH: formData.get("priceUAH"),
		compareAtUAH: formData.get("compareAtUAH"),
		stock: formData.get("stock"),
		description: formData.get("description"),
		published: formData.get("published") === "on",
	});

	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors, message: "Перевір поля форми." };
	}

	const existing = await prisma.product.findUnique({ where: { id } });
	if (!existing) return { success: false, message: "Товар не знайдено — можливо, вже видалений." };

	const { title, category, priceUAH, compareAtUAH, stock, description, published } = parsed.data;
	// Слаг перераховується лише якщо назва змінилась — інакше посилання на
	// товар (в кошику, вішлисті, старих замовленнях-знімках) лишаються живими.
	const slug = title === existing.title ? existing.slug : await uniqueSlug(title, id);

	await prisma.product.update({
		where: { id },
		data: {
			slug,
			title,
			category,
			priceUAH: priceUAH * 100,
			compareAt: compareAtUAH ? compareAtUAH * 100 : null,
			stock,
			description,
			status: published ? "PUBLISHED" : "DRAFT",
		},
	});

	revalidateShop();
	return { success: true, message: `Товар «${title}» оновлено.` };
}

export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
	await requireAdmin();

	const existing = await prisma.product.findUnique({ where: { id } });
	if (!existing) return { success: false, message: "Товар вже видалений." };

	// OrderItem.productId — onDelete: SetNull (schema.prisma, епізод 13): видалення
	// товару не ронить історичні замовлення, лише відв'язує їх від живого каталогу.
	await prisma.product.delete({ where: { id } });

	revalidateShop();
	return { success: true, message: `Товар «${existing.title}» видалено.` };
}
