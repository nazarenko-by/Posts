"use server";

import { checkoutSchema, type CheckoutState } from "@/lib/checkout-schema";
import { digitsOnly } from "@/lib/card";
import { mockStripeCharge } from "@/lib/mock-stripe";

// Файл з "use server" — Next.js дозволяє експортувати з нього лише
// async-функції (сама Zod-схема й тип стану — у lib/checkout-schema.ts).
//
// Це саме валідація й мок-оплата, не запис замовлення: Prisma-запис +
// email-квитанція — епізод 13. `submitCheckout` підтверджує, що дані
// пройшли Zod, і — якщо спосіб оплати "картка" — прикидає, чи Stripe
// (тестовий режим, мок) прийняв би платіж, повертаючи один з чотирьох
// станів: `invalid` (помилки по полях), `declined` (валідна форма, але
// мок-Stripe відхилив картку — для цього окрема модалка, не інлайн-помилка
// під полем), `success`.
export async function submitCheckout(_prevState: CheckoutState, formData: FormData): Promise<CheckoutState> {
	const raw = {
		firstName: formData.get("firstName"),
		lastName: formData.get("lastName"),
		email: formData.get("email"),
		phone: formData.get("phone"),
		city: formData.get("city"),
		address: formData.get("address"),
		shipping: formData.get("shipping"),
		payment: formData.get("payment"),
		cardNumber: formData.get("cardNumber"),
		cardExpiry: formData.get("cardExpiry"),
		cardCvc: formData.get("cardCvc"),
	};

	const parsed = checkoutSchema.safeParse(raw);

	if (!parsed.success) {
		const errors: CheckoutState["errors"] = {};
		for (const issue of parsed.error.issues) {
			const field = issue.path[0] as keyof CheckoutState["errors"];
			if (!errors[field]) errors[field] = issue.message;
		}
		return { status: "invalid", errors };
	}

	if (parsed.data.payment === "card") {
		const result = await mockStripeCharge(digitsOnly(parsed.data.cardNumber ?? ""));
		if (!result.ok) {
			return { status: "declined", errors: {}, declineMessage: result.message };
		}
	}

	return { status: "success", errors: {} };
}
