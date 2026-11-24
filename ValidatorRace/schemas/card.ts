// Епізод 12 — картка-хелпери для мок-оплати (Stripe test mode). Чиста логіка,
// без жодного SDK: форматування вводу й Luhn-перевірка номера картки — те
// саме, що реальний Stripe Elements робить на клієнті ще до відправки на сервер.

/** Прибирає все, крім цифр — з "4242 4242" лишає "42424242". */
export function digitsOnly(value: string): string {
	return value.replace(/\D/g, "");
}

/** "4242424242424242" → "4242 4242 4242 4242" (групи по 4, максимум 19 цифр). */
export function formatCardNumber(value: string): string {
	const digits = digitsOnly(value).slice(0, 19);
	return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** "1225" (у процесі вводу) → "12/25". Місяць 2 цифри, рік 2 цифри. */
export function formatExpiry(value: string): string {
	const digits = digitsOnly(value).slice(0, 4);
	if (digits.length <= 2) return digits;
	return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Проста бренд-детекція за першою цифрою — досить для UI-бейджа в демо. */
export function detectCardBrand(digits: string): "VISA" | "MASTERCARD" | null {
	if (digits.startsWith("4")) return "VISA";
	if (/^5[1-5]/.test(digits)) return "MASTERCARD";
	return null;
}

/** Luhn-алгоритм — стандартна контрольна сума номера картки (ISO/IEC 7812). */
export function isLuhnValid(digits: string): boolean {
	if (!/^\d{13,19}$/.test(digits)) return false;
	let sum = 0;
	let shouldDouble = false;
	for (let i = digits.length - 1; i >= 0; i--) {
		let d = Number(digits[i]);
		if (shouldDouble) {
			d *= 2;
			if (d > 9) d -= 9;
		}
		sum += d;
		shouldDouble = !shouldDouble;
	}
	return sum % 10 === 0;
}

/** "MM/YY" → чи не в минулому (кінець вказаного місяця). */
export function isExpiryValid(expiry: string): boolean {
	const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
	if (!match) return false;
	const month = Number(match[1]);
	const year = 2000 + Number(match[2]);
	if (month < 1 || month > 12) return false;
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1;
	return year > currentYear || (year === currentYear && month >= currentMonth);
}
