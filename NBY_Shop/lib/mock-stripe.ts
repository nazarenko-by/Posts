// Епізод 12 — мок Stripe test mode. У проєкту немає справжнього Stripe-акаунту
// (і немає мережі до api.stripe.com у цій пісочниці), тож замість реального
// SDK — та сама поведінка, що й Stripe у власному test mode: конкретні тестові
// номери карток документовані на docs.stripe.com/testing і завжди повертають
// один і той самий результат. Будь-яка інша картка, що проходить Luhn, —
// вважається успішною, так само як у самого Stripe.

export type MockChargeResult =
	| { ok: true }
	| {
			ok: false;
			reason: "card_declined" | "insufficient_funds" | "expired_card" | "incorrect_cvc";
			message: string;
	  };

// Номери — буквально ті, що в документації Stripe Testing (розділ "Cards").
const TEST_CARDS: Record<string, MockChargeResult> = {
	"4242424242424242": { ok: true },
	"4000000000000002": {
		ok: false,
		reason: "card_declined",
		message: "Банк відхилив картку. Спробуй іншу картку або спосіб оплати.",
	},
	"4000000000009995": {
		ok: false,
		reason: "insufficient_funds",
		message: "Недостатньо коштів на картці.",
	},
	"4000000000000069": {
		ok: false,
		reason: "expired_card",
		message: "Строк дії картки закінчився.",
	},
	"4000000000000127": {
		ok: false,
		reason: "incorrect_cvc",
		message: "Невірний CVV-код.",
	},
};

/**
 * Мок-версія `stripe.paymentIntents.confirm` — той самий контракт (проміс,
 * що резолвиться success/decline), без жодного реального виклику мережі.
 * Затримка імітує справжній round-trip до Stripe API.
 */
export async function mockStripeCharge(cardNumberDigits: string): Promise<MockChargeResult> {
	await new Promise((resolve) => setTimeout(resolve, 650));
	return TEST_CARDS[cardNumberDigits] ?? { ok: true };
}
