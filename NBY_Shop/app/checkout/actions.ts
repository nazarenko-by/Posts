"use server";

import { checkoutSchema, type CheckoutState } from "@/lib/checkout-schema";
import { digitsOnly } from "@/lib/card";
import { mockStripeCharge } from "@/lib/mock-stripe";
import { prisma } from "@/lib/prisma";
import { SHIPPING_OPTIONS, PAYMENT_OPTIONS, COD_FEE_UAH } from "@/lib/pricing";
import { formatOrderNumber } from "@/lib/order-number";
import { sendOrderReceiptEmail } from "@/lib/mock-email";
import { getCurrentUser } from "@/lib/auth";

// Файл з "use server" — Next.js дозволяє експортувати з нього лише
// async-функції (сама Zod-схема й тип стану — у lib/checkout-schema.ts).
//
// Епізод 11: Zod-валідація. Епізод 12: мок-Stripe для payment==="card".
// Епізод 13 (це доповнення) — нарешті сам запис: `submitCheckout` тепер
// повертає `success` лише ПІСЛЯ реального `prisma.order.create` (з
// вкладеним OrderItem[]) і мок-квитанції на email.
//
// Кошик (епізод 7) живе лише в localStorage — клієнт передає лише
// slug+qty (прихований input "cartItems", CheckoutForm.tsx), а НЕ ціни й
// назви: той самий принцип чесності, що мок-Stripe і мок-email — сервер
// нікому не вірить на слово, а перечитує товари з Prisma за slug і рахує
// totalUAH сам (lib/pricing.ts — ті самі константи, що рендерить форма).
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

	let cartItems: { slug: string; qty: number }[] = [];
	try {
		const parsedCart = JSON.parse(String(formData.get("cartItems") ?? "[]"));
		if (Array.isArray(parsedCart)) {
			cartItems = parsedCart.filter(
				(i): i is { slug: string; qty: number } =>
					i && typeof i.slug === "string" && typeof i.qty === "number" && i.qty > 0
			);
		}
	} catch {
		cartItems = [];
	}

	if (cartItems.length === 0) {
		return { status: "invalid", errors: {} };
	}

	// Живі товари з БД — не з кошика/форми. Ціна й назва на момент покупки
	// знімаються сюди (OrderItem), стан "живого" каталогу далі не важливий.
	const products = await prisma.product.findMany({
		where: { slug: { in: cartItems.map((i) => i.slug) }, status: "PUBLISHED" },
	});

	const orderItemsData = cartItems.flatMap((ci) => {
		const product = products.find((p) => p.slug === ci.slug);
		if (!product) return [];
		const qty = Math.max(1, Math.min(ci.qty, product.stock || ci.qty));
		return [
			{
				productId: product.id,
				productSlug: product.slug,
				title: product.title,
				priceUAH: product.priceUAH,
				qty,
			},
		];
	});

	if (orderItemsData.length === 0) {
		return { status: "invalid", errors: {} };
	}

	const shippingOption = SHIPPING_OPTIONS.find((s) => s.value === parsed.data.shipping);
	const paymentOption = PAYMENT_OPTIONS.find((p) => p.value === parsed.data.payment);
	if (!shippingOption || !paymentOption) {
		return { status: "invalid", errors: {} };
	}

	const codFeeUAH = parsed.data.payment === "cod" ? COD_FEE_UAH : 0;
	const itemsTotalUAH = orderItemsData.reduce((sum, i) => sum + i.priceUAH * i.qty, 0);
	const totalUAH = itemsTotalUAH + shippingOption.priceUAH + codFeeUAH;

	// Епізод 14 — якщо оформлює залогінений юзер, замовлення одразу зʼявиться
	// в його /account. Гостьовий чекаут (userId undefined → Prisma пише null)
	// і далі валідний — авторизація не стала обов'язковою для покупки.
	const currentUser = await getCurrentUser();

	const order = await prisma.order.create({
		data: {
			userId: currentUser?.id,
			firstName: parsed.data.firstName,
			lastName: parsed.data.lastName,
			email: parsed.data.email,
			phone: parsed.data.phone,
			city: parsed.data.city,
			address: parsed.data.address,
			shipping: parsed.data.shipping,
			shippingCostUAH: shippingOption.priceUAH,
			payment: parsed.data.payment,
			codFeeUAH,
			totalUAH,
			items: { create: orderItemsData },
		},
	});

	const orderNumber = formatOrderNumber(order.orderSeq, order.createdAt);

	await sendOrderReceiptEmail({ to: parsed.data.email, orderNumber, totalUAH });

	return {
		status: "success",
		errors: {},
		order: {
			number: orderNumber,
			city: parsed.data.city,
			address: parsed.data.address,
			shippingLabel: shippingOption.label,
			paymentLabel: paymentOption.label,
			totalUAH,
		},
	};
}
