// Епізод 13 — мок email-квитанції. Немає підключеного email-провайдера
// (Resend/SendGrid/SMTP) і мережі назовні в цій пісочниці, тож той самий
// принцип, що lib/mock-stripe.ts: реальний асинхронний контракт, без
// фактичного мережевого виклику — сама "відправка" лише фіксується в
// консолі сервера (console.warn — єдиний console-метод, дозволений
// eslint-конфігом для не-error випадків, див. no-console у прикладах
// prisma/seed.ts).
import { formatUAH } from "@/lib/format";

export async function sendOrderReceiptEmail(params: {
	to: string;
	orderNumber: string;
	totalUAH: number;
}): Promise<{ ok: true }> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	console.warn(
		`[mock-email] Квитанція ${params.orderNumber} відправлена на ${params.to} — ${formatUAH(params.totalUAH)}`
	);
	return { ok: true };
}
