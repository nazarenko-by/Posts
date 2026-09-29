import { z } from "zod";

// Епізод 15 — форма товару в admin. Ціна/стара ціна приходять з UI в ₴
// (людяно, той самий підхід, що фільтр ціни в app/page.tsx), тут же переводимо
// в копійки — єдине місце, де Zod і "гроші завжди Int" (DESIGN_SYSTEM.md)
// перетинаються для admin-потоку.
export const productSchema = z.object({
	title: z.string().trim().min(3, "Мінімум 3 символи").max(120),
	category: z.string().trim().min(1, "Обери категорію"),
	priceUAH: z.coerce.number().int().positive("Ціна має бути більшою за 0"),
	compareAtUAH: z
		.union([z.literal(""), z.coerce.number().int().positive("Стара ціна має бути більшою за 0")])
		.optional()
		.transform((v) => (v === "" || v === undefined ? undefined : v)),
	stock: z.coerce.number().int().min(0, "Не може бути відʼємним"),
	description: z
		.string()
		.trim()
		.max(2000)
		.optional()
		.transform((v) => (v === "" ? undefined : v)),
	published: z.coerce.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;

export type ProductFormState = {
	success: boolean;
	errors?: Partial<Record<keyof ProductInput, string[]>>;
	message?: string;
};
