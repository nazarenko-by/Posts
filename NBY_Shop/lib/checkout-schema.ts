import { z } from "zod";
import { digitsOnly, isExpiryValid, isLuhnValid } from "@/lib/card";

// Епізод 11 — перший реальний Zod у проєкті. Файли з "use server" (action.ts)
// можуть експортувати лише async-функції (правило Next.js для Server Actions),
// тож сама схема й тип стану живуть тут, окремо від app/checkout/actions.ts.
//
// Епізод 12 (Stripe test mode, мок) — додано 3 картkові поля. Вони НЕ звичайні
// z.string() з .min()/.regex() напряму в object(), бо обов'язкові лише коли
// payment === "card" (Apple Pay/накладений платіж їх не мають) — тому
// перевірка card-полів винесена у .superRefine нижче, а самі поля тут
// optional. Luhn/термін дії — та сама логіка, що клієнтський Stripe Elements
// зробив би ще до відправки форми (lib/card.ts).

export const checkoutSchema = z
	.object({
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
		cardNumber: z.string().trim().optional(),
		cardExpiry: z.string().trim().optional(),
		cardCvc: z.string().trim().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.payment !== "card") return;

		const digits = digitsOnly(data.cardNumber ?? "");
		if (!isLuhnValid(digits)) {
			ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Недійсний номер картки" });
		}

		if (!isExpiryValid(data.cardExpiry ?? "")) {
			ctx.addIssue({ code: "custom", path: ["cardExpiry"], message: "Формат MM/YY, не в минулому" });
		}

		if (!/^\d{3,4}$/.test(data.cardCvc ?? "")) {
			ctx.addIssue({ code: "custom", path: ["cardCvc"], message: "3-4 цифри" });
		}
	});

export type CheckoutFields = keyof z.infer<typeof checkoutSchema>;

export type CheckoutState = {
	status: "idle" | "invalid" | "success" | "declined";
	errors: Partial<Record<CheckoutFields, string>>;
	declineMessage?: string;
};

export const initialCheckoutState: CheckoutState = { status: "idle", errors: {} };
