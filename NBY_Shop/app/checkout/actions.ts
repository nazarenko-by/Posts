"use server";

import { checkoutSchema, type CheckoutState } from "@/lib/checkout-schema";

// Файл з "use server" — Next.js дозволяє експортувати з нього лише
// async-функції (сама Zod-схема й тип стану — у lib/checkout-schema.ts).
//
// Це саме валідація, не запис замовлення: Prisma-запис + email-квитанція —
// епізод 13. Тут `submitCheckout` лише підтверджує, що дані пройшли Zod,
// і повертає або `errors` по полях (useActionState рендерить їх інлайн під
// кожним інпутом), або `success` — без жодного side-effect на сервері.
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

	return { status: "success", errors: {} };
}
