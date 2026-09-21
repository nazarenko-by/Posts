import { z } from "zod";

// Епізод 11 — перший реальний Zod у проєкті. Файли з "use server" (action.ts)
// можуть експортувати лише async-функції (правило Next.js для Server Actions),
// тож сама схема й тип стану живуть тут, окремо від app/checkout/actions.ts.

export const checkoutSchema = z.object({
	firstName: z.string().trim().min(2, "Мінімум 2 символи"),
	lastName: z.string().trim().min(2, "Мінімум 2 символи"),
	email: z.string().trim().email("Некоректний email"),
	// +380 та рівно 9 цифр — реальний укр. формат, без пробілів/дужок.
	phone: z
		.string()
		.trim()
		.regex(/^\+380\d{9}$/, "Формат: +380XXXXXXXXX"),
	city: z.string().trim().min(2, "Вкажи місто"),
	address: z.string().trim().min(5, "Вкажи адресу або відділення"),
	shipping: z.enum(["nova_poshta", "courier", "pickup"], {
		message: "Обери спосіб доставки",
	}),
	payment: z.enum(["card", "apple_pay", "cod"], {
		message: "Обери спосіб оплати",
	}),
});

export type CheckoutFields = keyof z.infer<typeof checkoutSchema>;

export type CheckoutState = {
	status: "idle" | "invalid" | "success";
	errors: Partial<Record<CheckoutFields, string>>;
};

export const initialCheckoutState: CheckoutState = { status: "idle", errors: {} };
