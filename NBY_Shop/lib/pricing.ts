// Епізод 13 — винесено з CheckoutForm.tsx (епізод 11), щоб мати ОДНЕ джерело
// правди для цін доставки/оплати як на клієнті (рендер списку опцій), так і
// на сервері (app/checkout/actions.ts рахує totalUAH сам, а не бере з форми
// — клієнтський total можна підмінити, ці константи в actions.ts — ні).

export const SHIPPING_OPTIONS = [
	{
		value: "nova_poshta",
		label: "Нова Пошта — відділення",
		meta: "1–2 дні · безкоштовно від 1 500 ₴",
		priceUAH: 0,
	},
	{ value: "courier", label: "Курʼєр до дверей", meta: "У Києві — сьогодні до 20:00", priceUAH: 9_900 },
	{ value: "pickup", label: "Самовивіз", meta: "вул. Ділова 5, пн–пт 10:00–19:00", priceUAH: 0 },
] as const;

export const PAYMENT_OPTIONS = [
	{ value: "card", label: "Картка онлайн", meta: "Visa · Mastercard" },
	{ value: "apple_pay", label: "Apple Pay", meta: "Один дотик" },
	{ value: "cod", label: "Оплата при отриманні", meta: "+20 ₴" },
] as const;

export const COD_FEE_UAH = 2_000;

export type ShippingValue = (typeof SHIPPING_OPTIONS)[number]["value"];
export type PaymentValue = (typeof PAYMENT_OPTIONS)[number]["value"];
