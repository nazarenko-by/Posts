"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useCart } from "@/context/CartContext";
import { formatUAH } from "@/lib/format";
import { submitCheckout } from "@/app/checkout/actions";
import { initialCheckoutState, type CheckoutState } from "@/lib/checkout-schema";
import { detectCardBrand, digitsOnly, formatCardNumber, formatExpiry } from "@/lib/card";
import { PaymentDeclinedModal } from "@/components/PaymentDeclinedModal";

// Епізод 11 — Server Action + Zod (schema/тип у lib/checkout-schema.ts, сама
// дія — app/checkout/actions.ts). Одна сторінка на всіх екранах (рішення від
// 21.09.2026, project_nby_checkout_layout_decision): 3-кружечковий індикатор
// зверху — trust-бейдж, не реальний wizard-стан, кроки не перемикають вигляд.
//
// Summary й підсумок доставки — клієнтські (useCart), бо кошик живе лише в
// localStorage (епізод 7); сам submit іде через справжній Server Action.
//
// Замовлення НЕ пишеться в БД тут — лише валідується. Prisma-запис +
// email-квитанція — епізод 13. На успіх кошик очищається і рендериться
// проміжний банер (не справжній success-екран з кіту — той з номером
// замовлення й таймлайном належить епізоду 13, коли замовлення реально
// існує в БД).
//
// Телефон (додано 22.09.2026) — магазин доставляє лише по Україні (Hero,
// Нова Пошта), тож код країни не вибирається зі списку, а зафіксований
// "+380" зліва від інпуту, не редагується. Видимий інпут приймає лише
// 9 цифр (maxLength, strip нецифр onChange) і не має власного name —
// реально сабмітиться прихований input[name="phone"] зі складеним
// "+380" + цифри. checkoutSchema (lib/checkout-schema.ts) лишається
// незмінною: вона й далі валідує повний рядок за тим самим regex.
//
// Епізод 12 — карткові поля (номер/MM-YY/CVV) з'являються лише коли
// payment === "card" (кіт: COMPONENTS.md → s_checkout, "Payment method
// cards"). Форматування — той самий підхід, що і в телефоні: контрольований
// інпут форматує для ока (lib/card.ts), а сабмітиться те саме значення —
// digitsOnly застосовується і в схемі, і в actions.ts перед мок-оплатою.
// Відхилення оплати (submitCheckout повертає status:"declined") показує
// PaymentDeclinedModal — кіт явно вимагає модалку, не toast, для критичних
// помилок оплати (борг з епізоду 8, ToastContext).

const SHIPPING_OPTIONS = [
	{
		value: "nova_poshta",
		label: "Нова Пошта — відділення",
		meta: "1–2 дні · безкоштовно від 1 500 ₴",
		priceUAH: 0,
	},
	{ value: "courier", label: "Курʼєр до дверей", meta: "У Києві — сьогодні до 20:00", priceUAH: 9_900 },
	{ value: "pickup", label: "Самовивіз", meta: "вул. Ділова 5, пн–пт 10:00–19:00", priceUAH: 0 },
] as const;

const PAYMENT_OPTIONS = [
	{ value: "card", label: "Картка онлайн", meta: "Visa · Mastercard" },
	{ value: "apple_pay", label: "Apple Pay", meta: "Один дотик" },
	{ value: "cod", label: "Оплата при отриманні", meta: "+20 ₴" },
] as const;

const COD_FEE_UAH = 2_000;

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="mt-1 text-[11.5px] text-danger">{message}</p>;
}

function fieldClass(hasError: boolean) {
	return `flex h-10 w-full items-center rounded-control border bg-bg px-3 font-sans text-[13.5px] text-fg outline-none ${
		hasError ? "border-danger" : "border-border focus:border-border-strong"
	}`;
}

export function CheckoutForm() {
	const { items, totalUAH, clear } = useCart();
	const [state, formAction, isPending] = useActionState<CheckoutState, FormData>(
		submitCheckout,
		initialCheckoutState
	);
	const [shipping, setShipping] = useState<(typeof SHIPPING_OPTIONS)[number]["value"]>("nova_poshta");
	const [payment, setPayment] = useState<(typeof PAYMENT_OPTIONS)[number]["value"]>("card");
	const [phoneDigits, setPhoneDigits] = useState("");
	const [cardNumber, setCardNumber] = useState("");
	const [cardExpiry, setCardExpiry] = useState("");
	const [cardCvc, setCardCvc] = useState("");
	// Порівнюємо за посиланням, не булевим прапорцем: useActionState повертає
	// НОВИЙ об'єкт стану на кожен сабміт, тож після закриття модалки й повторної
	// відмови (новий об'єкт з тим самим status:"declined") вона покажеться знову.
	// setState живе в onClick — звичайний обробник події, не useEffect, тож
	// react-hooks/set-state-in-effect (урок з WishlistGrid, еп.9) тут не діє.
	const [dismissedDecline, setDismissedDecline] = useState<CheckoutState | null>(null);
	const showDeclineModal = state.status === "declined" && dismissedDecline !== state;

	useEffect(() => {
		if (state.status === "success") clear();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.status]);

	if (state.status === "success") {
		return (
			<div className="mx-auto max-w-[560px] px-6 py-24 text-center">
				<div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-ok-subtle text-ok">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
						<path d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h1 className="text-[22px] font-semibold text-fg">
					{payment === "card"
						? "Оплата підтверджена — форма готова"
						: "Дані валідні — форма готова до оплати"}
				</h1>
				<p className="mt-2 text-[13.5px] text-fg-muted">
					{payment === "card"
						? "Stripe test mode (мок): картка пройшла перевірку, гроші не списано. Сам запис замовлення в БД і квитанція на email — епізод 13."
						: "Демо-стан епізоду 11: сам запис замовлення в БД і квитанція на email — епізод 13."}
				</p>
				<Link
					href="/"
					className="mt-6 inline-flex h-10 items-center rounded-control bg-fg px-5 font-mono text-[13px] font-medium text-bg no-underline"
				>
					Повернутись у каталог
				</Link>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="mx-auto max-w-[560px] px-6 py-24 text-center">
				<h1 className="text-[20px] font-semibold text-fg">Кошик порожній</h1>
				<p className="mt-2 text-[13.5px] text-fg-muted">Додай товар із каталогу, щоб оформити замовлення.</p>
				<Link
					href="/"
					className="mt-6 inline-flex h-10 items-center rounded-control bg-fg px-5 font-mono text-[13px] font-medium text-bg no-underline"
				>
					До каталогу
				</Link>
			</div>
		);
	}

	const shippingCost = SHIPPING_OPTIONS.find((s) => s.value === shipping)?.priceUAH ?? 0;
	const codFee = payment === "cod" ? COD_FEE_UAH : 0;
	const total = totalUAH + shippingCost + codFee;

	return (
		<>
			<form action={formAction} className="mx-auto max-w-6xl px-6 py-8">
				{/* міні-хедер чекауту — власний, не ShopHeader (кіт: s_checkout) */}
				<div className="mb-8 flex items-center justify-between border-b border-border pb-5">
					<div className="flex items-center gap-3">
						<span className="grid h-7 w-7 place-items-center rounded-[8px] bg-accent font-mono text-[9px] font-bold text-white">
							NBY
						</span>
						<div className="flex items-center gap-3 font-mono text-[12px] text-fg-subtle">
							<span className="flex items-center gap-[7px] text-fg">
								<span className="grid h-[19px] w-[19px] place-items-center rounded-full bg-accent text-[10px] font-semibold text-white">
									1
								</span>
								Дані
							</span>
							<span className="h-px w-6 bg-border" />
							<span className="flex items-center gap-[7px]">
								<span className="grid h-[19px] w-[19px] place-items-center rounded-full border border-border-strong text-[10px] font-semibold">
									2
								</span>
								Оплата
							</span>
							<span className="h-px w-6 bg-border" />
							<span className="flex items-center gap-[7px]">
								<span className="grid h-[19px] w-[19px] place-items-center rounded-full border border-border-strong text-[10px] font-semibold">
									3
								</span>
								Готово
							</span>
						</div>
					</div>
					<span className="flex items-center gap-1.5 font-mono text-[11.5px] text-fg-subtle">
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<rect x="5" y="11" width="14" height="9" rx="2" />
							<path d="M8 11V7a4 4 0 0 1 8 0v4" />
						</svg>
						захищене з&apos;єднання
					</span>
				</div>

				<div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_.92fr]">
					<div className="flex flex-col gap-9">
						{/* 1 · Контакти */}
						<section className="flex flex-col gap-4">
							<h2 className="text-[15px] font-semibold text-fg">1 · Контакти</h2>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<label className="flex flex-col gap-1.5">
									<span className="text-[12px] font-medium text-fg-muted">Ім&apos;я *</span>
									<input name="firstName" className={fieldClass(Boolean(state.errors.firstName))} />
									<FieldError message={state.errors.firstName} />
								</label>
								<label className="flex flex-col gap-1.5">
									<span className="text-[12px] font-medium text-fg-muted">Прізвище *</span>
									<input name="lastName" className={fieldClass(Boolean(state.errors.lastName))} />
									<FieldError message={state.errors.lastName} />
								</label>
								<label className="flex flex-col gap-1.5">
									<span className="text-[12px] font-medium text-fg-muted">Email *</span>
									<input
										name="email"
										type="email"
										className={fieldClass(Boolean(state.errors.email))}
									/>
									<FieldError message={state.errors.email} />
								</label>
								<label className="flex flex-col gap-1.5">
									<span className="text-[12px] font-medium text-fg-muted">Телефон *</span>
									<div
										className={`flex h-10 w-full items-stretch overflow-hidden rounded-control border bg-bg ${
											state.errors.phone
												? "border-danger"
												: "border-border focus-within:border-border-strong"
										}`}
									>
										{/* Код країни не вибирається — магазин доставляє лише по Україні
									    (Нова Пошта/Hero), тож "+380" зафіксований і не редагується. */}
										<span className="flex items-center gap-1.5 border-r border-border bg-bg-subtle px-2.5 font-mono text-[13px] text-fg-muted">
											🇺🇦 +380
										</span>
										<input
											value={phoneDigits}
											onChange={(e) =>
												setPhoneDigits(e.target.value.replace(/\D/g, "").slice(0, 9))
											}
											inputMode="numeric"
											placeholder="671234567"
											aria-label="Телефон, 9 цифр після +380"
											className="flex-1 bg-transparent px-3 font-sans text-[13.5px] text-fg outline-none"
										/>
									</div>
									<input type="hidden" name="phone" value={`+380${phoneDigits}`} />
									<FieldError message={state.errors.phone} />
								</label>
							</div>
						</section>

						{/* 2 · Доставка */}
						<section className="flex flex-col gap-4">
							<h2 className="text-[15px] font-semibold text-fg">2 · Доставка</h2>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<label className="flex flex-col gap-1.5">
									<span className="text-[12px] font-medium text-fg-muted">Місто *</span>
									<input name="city" className={fieldClass(Boolean(state.errors.city))} />
									<FieldError message={state.errors.city} />
								</label>
								<label className="flex flex-col gap-1.5">
									<span className="text-[12px] font-medium text-fg-muted">Адреса / відділення *</span>
									<input name="address" className={fieldClass(Boolean(state.errors.address))} />
									<FieldError message={state.errors.address} />
								</label>
							</div>

							<div className="flex flex-col gap-2.5">
								{SHIPPING_OPTIONS.map((opt) => (
									<label
										key={opt.value}
										className={`flex cursor-pointer items-center gap-3 rounded-control border px-4 py-3.5 ${
											shipping === opt.value
												? "border-accent bg-accent-subtle"
												: "border-border hover:border-border-strong"
										}`}
									>
										<input
											type="radio"
											name="shipping"
											value={opt.value}
											checked={shipping === opt.value}
											onChange={() => setShipping(opt.value)}
											className="h-4 w-4 accent-accent"
										/>
										<span className="flex flex-1 flex-col gap-0.5">
											<span className="text-[13.5px] font-medium text-fg">{opt.label}</span>
											<span className="text-[11.5px] text-fg-muted">{opt.meta}</span>
										</span>
										<span className="font-mono text-[13px] font-semibold text-ok">
											{opt.priceUAH === 0 ? "0 ₴" : formatUAH(opt.priceUAH)}
										</span>
									</label>
								))}
							</div>
							<FieldError message={state.errors.shipping} />
						</section>

						{/* 3 · Оплата */}
						<section className="flex flex-col gap-4">
							<h2 className="text-[15px] font-semibold text-fg">3 · Оплата</h2>
							<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
								{PAYMENT_OPTIONS.map((opt) => (
									<label
										key={opt.value}
										className={`flex cursor-pointer flex-col gap-2 rounded-control border p-3.5 ${
											payment === opt.value
												? "border-accent bg-accent-subtle"
												: "border-border hover:border-border-strong"
										}`}
									>
										<input
											type="radio"
											name="payment"
											value={opt.value}
											checked={payment === opt.value}
											onChange={() => setPayment(opt.value)}
											className="sr-only"
										/>
										<span className="text-[13px] font-medium text-fg">{opt.label}</span>
										<span className="font-mono text-[11px] text-fg-muted">{opt.meta}</span>
									</label>
								))}
							</div>
							<FieldError message={state.errors.payment} />

							{payment === "card" && (
								<div className="flex flex-col gap-3 rounded-control border border-border bg-bg-subtle p-4">
									<div className="grid grid-cols-[1.6fr_1fr_1fr] gap-3">
										<label className="flex flex-col gap-1.5">
											<span className="text-[12px] font-medium text-fg-muted">
												Номер картки *
											</span>
											<div
												className={`relative flex h-10 w-full items-center rounded-control border bg-bg ${
													state.errors.cardNumber
														? "border-danger"
														: "border-border focus-within:border-border-strong"
												}`}
											>
												<input
													name="cardNumber"
													value={cardNumber}
													onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
													inputMode="numeric"
													placeholder="4242 4242 4242 4242"
													aria-label="Номер картки"
													className="w-full flex-1 bg-transparent pl-3 pr-14 font-mono text-[13.5px] text-fg outline-none"
												/>
												{detectCardBrand(digitsOnly(cardNumber)) && (
													<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-semibold text-fg-subtle">
														{detectCardBrand(digitsOnly(cardNumber))}
													</span>
												)}
											</div>
											<FieldError message={state.errors.cardNumber} />
										</label>
										<label className="flex flex-col gap-1.5">
											<span className="text-[12px] font-medium text-fg-muted">MM / YY *</span>
											<input
												name="cardExpiry"
												value={cardExpiry}
												onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
												inputMode="numeric"
												placeholder="12/28"
												aria-label="Термін дії картки"
												className={fieldClass(Boolean(state.errors.cardExpiry))}
											/>
											<FieldError message={state.errors.cardExpiry} />
										</label>
										<label className="flex flex-col gap-1.5">
											<span className="text-[12px] font-medium text-fg-muted">CVV *</span>
											<input
												name="cardCvc"
												value={cardCvc}
												onChange={(e) => setCardCvc(digitsOnly(e.target.value).slice(0, 4))}
												inputMode="numeric"
												placeholder="123"
												aria-label="CVV-код"
												className={fieldClass(Boolean(state.errors.cardCvc))}
											/>
											<FieldError message={state.errors.cardCvc} />
										</label>
									</div>

									<label className="flex items-center gap-2 text-[12.5px] text-fg-muted">
										<input type="checkbox" className="h-3.5 w-3.5 accent-accent" disabled />
										Зберегти картку для наступних покупок
										<span className="font-mono text-[10.5px] text-fg-subtle">
											(потребує акаунта — епізод 14)
										</span>
									</label>

									<p className="font-mono text-[10.5px] leading-relaxed text-fg-subtle">
										Stripe test mode (мок): 4242 4242 4242 4242 — успіх · 4000 0000 0000 0002 —
										відхилено · 4000 0000 0000 9995 — недостатньо коштів · MM/YY у майбутньому, CVV
										— будь-які 3 цифри.
									</p>
								</div>
							)}
						</section>
					</div>

					{/* Order summary */}
					<aside className="flex h-fit flex-col gap-4 rounded-card border border-border bg-bg-subtle p-5">
						<h2 className="text-[15px] font-semibold text-fg">Замовлення</h2>
						<div className="flex flex-col gap-3">
							{items.map((item) => (
								<div key={item.slug} className="flex items-center gap-3">
									<div
										className="h-[52px] w-[44px] flex-none rounded-[8px] border border-border bg-bg-muted"
										style={{
											backgroundImage:
												"repeating-linear-gradient(135deg, transparent 0 7px, rgba(127,127,127,.06) 7px 14px)",
										}}
									/>
									<div className="flex flex-1 flex-col gap-0.5">
										<span className="text-[12.5px] font-medium text-fg">{item.title}</span>
										<span className="font-mono text-[11px] text-fg-subtle">
											{item.qty} × {formatUAH(item.priceUAH)}
										</span>
									</div>
									<span className="font-mono text-[12.5px] font-semibold text-fg">
										{formatUAH(item.qty * item.priceUAH)}
									</span>
								</div>
							))}
						</div>

						<div className="flex flex-col gap-1.5 border-t border-border pt-3 text-[12.5px]">
							<div className="flex justify-between text-fg-muted">
								<span>Товари</span>
								<span className="font-mono text-fg">{formatUAH(totalUAH)}</span>
							</div>
							<div className="flex justify-between text-fg-muted">
								<span>Доставка</span>
								<span className="font-mono text-fg">
									{shippingCost === 0 ? "безкоштовно" : formatUAH(shippingCost)}
								</span>
							</div>
							{codFee > 0 && (
								<div className="flex justify-between text-fg-muted">
									<span>Оплата при отриманні</span>
									<span className="font-mono text-fg">{formatUAH(codFee)}</span>
								</div>
							)}
							<div className="flex justify-between border-t border-border pt-2 text-[13.5px] font-semibold text-fg">
								<span>Разом</span>
								<span className="font-mono">{formatUAH(total)}</span>
							</div>
						</div>

						<button
							type="submit"
							disabled={isPending}
							className="h-11 rounded-control bg-accent font-mono text-[13.5px] font-medium text-white disabled:opacity-60"
						>
							{isPending ? "Перевіряємо…" : `Оплатити ${formatUAH(total)}`}
						</button>
					</aside>
				</div>
			</form>
			{showDeclineModal && (
				<PaymentDeclinedModal
					message={state.declineMessage ?? "Оплату відхилено."}
					onClose={() => setDismissedDecline(state)}
				/>
			)}
		</>
	);
}
