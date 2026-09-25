"use client";

import { useState } from "react";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/auth/actions";
import { initialAuthState, type AuthState } from "@/lib/auth-schema";
import { buttonVariants } from "@/components/ui/button";

// Епізод 14 — s_auth з кіту (COMPONENTS.md): split-panel картка. Кіт малює
// ліву панель під NextAuth (`await signIn("github", {...})`) — ми свідомо
// відхилились від буквального макета (тема поста дозволяла "NextAuth/власний
// JWT", обрали власний, підхоплюючи урок з поста #155): код-приклад зліва
// показує наш реальний signJwt(), а OAuth-кнопки праворуч лишились лише
// декоративними (задизейблені, з поясненням) — так само, як "зберегти
// картку" в CheckoutForm.tsx (епізод 12), а не приховані зовсім, щоб не
// втратити візуальну відповідність кіту.
//
// Два незалежні useActionState (signIn/signUp) замість одного — кожен
// Server Action має власну сигнатуру стану, перемикання табів просто
// вибирає, який з двох рендерити.

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="mt-1 text-[12px] text-danger">{message}</p>;
}

function fieldClass(hasError: boolean) {
	return `flex h-11 w-full items-center rounded-control border bg-bg px-3.5 font-sans text-[14px] text-fg outline-none ${
		hasError ? "border-danger" : "border-border focus:border-border-strong"
	}`;
}

function tabClass(active: boolean) {
	return `flex-1 rounded-[7px] py-2.5 text-center text-[13.5px] font-medium transition-colors ${
		active ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg"
	}`;
}

function passwordStrength(password: string): number {
	let score = 0;
	if (password.length >= 8) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[^A-Za-z0-9]/.test(password)) score += 1;
	return score;
}

export function AuthForm({ callbackUrl = "/account" }: { callbackUrl?: string }) {
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [signInState, signInFormAction, signInPending] = useActionState<AuthState, FormData>(
		signIn,
		initialAuthState
	);
	const [signUpState, signUpFormAction, signUpPending] = useActionState<AuthState, FormData>(
		signUp,
		initialAuthState
	);
	const [showPassword, setShowPassword] = useState(false);
	const [signUpPassword, setSignUpPassword] = useState("");

	const state = mode === "signin" ? signInState : signUpState;
	const action = mode === "signin" ? signInFormAction : signUpFormAction;
	const isPending = mode === "signin" ? signInPending : signUpPending;
	const strength = passwordStrength(signUpPassword);

	return (
		<div className="mx-auto grid max-w-[880px] grid-cols-1 overflow-hidden rounded-card border border-border md:min-h-[560px] md:grid-cols-2">
			{/* ліва панель — брендинг + реальний код нашого signJwt() */}
			<div className="hidden flex-col justify-between gap-10 bg-accent p-10 text-white md:flex">
				<div className="flex flex-col gap-3">
					<span className="grid h-8 w-8 place-items-center rounded-[8px] bg-white/15 font-mono text-[11px] font-bold">
						NBY
					</span>
					<h1 className="mt-2 text-[24px] font-semibold leading-tight">
						Один акаунт — історія всіх замовлень
					</h1>
					<p className="text-[14px] leading-relaxed text-white/75">
						Сесія — httpOnly-кука з JWT, який магазин підписує й перевіряє сам, без стороннього провайдера.
					</p>
				</div>
				<pre className="overflow-x-auto rounded-control bg-black/20 p-4 font-mono text-[12.5px] leading-relaxed text-white/70">
					{`// lib/jwt.ts — власний, не NextAuth
const token = signJwt(
  { sub: user.id },
  secret,
  THIRTY_DAYS
);`}
				</pre>
			</div>

			{/* права панель — форма */}
			<div className="flex flex-col gap-5 bg-bg p-7 md:p-9">
				<div className="flex gap-1 rounded-control border border-border bg-bg-subtle p-1">
					<button type="button" onClick={() => setMode("signin")} className={tabClass(mode === "signin")}>
						Увійти
					</button>
					<button type="button" onClick={() => setMode("signup")} className={tabClass(mode === "signup")}>
						Реєстрація
					</button>
				</div>

				{state.status === "error" && state.errors.form && (
					<div className="rounded-control border border-danger bg-danger-subtle px-4 py-3 text-[13px] text-danger">
						{state.errors.form}
					</div>
				)}

				<form action={action} key={mode} className="flex flex-col gap-4">
					<input type="hidden" name="callbackUrl" value={callbackUrl} />

					{mode === "signup" && (
						<label className="flex flex-col gap-1.5">
							<span className="text-[12.5px] font-medium text-fg-muted">Ім&apos;я *</span>
							<input name="name" className={fieldClass(Boolean(state.errors.name))} />
							<FieldError message={state.errors.name} />
						</label>
					)}

					<label className="flex flex-col gap-1.5">
						<span className="text-[12.5px] font-medium text-fg-muted">Email *</span>
						<input name="email" type="email" className={fieldClass(Boolean(state.errors.email))} />
						<FieldError message={state.errors.email} />
					</label>

					<label className="flex flex-col gap-1.5">
						<span className="text-[12.5px] font-medium text-fg-muted">Пароль *</span>
						<div
							className={`flex h-11 items-center rounded-control border bg-bg px-3.5 ${
								state.errors.password
									? "border-danger"
									: "border-border focus-within:border-border-strong"
							}`}
						>
							<input
								name="password"
								type={showPassword ? "text" : "password"}
								onChange={mode === "signup" ? (e) => setSignUpPassword(e.target.value) : undefined}
								className="flex-1 bg-transparent font-sans text-[14px] text-fg outline-none"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
								className="text-fg-subtle hover:text-fg"
							>
								{showPassword ? (
									<svg
										width="17"
										height="17"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.8"
									>
										<path d="M3 3l18 18" />
										<path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" />
										<path d="M9.4 5.3A10.9 10.9 0 0 1 12 5c5 0 9 4 10 7a11.9 11.9 0 0 1-3.1 4.1M6.5 6.6A12 12 0 0 0 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6" />
									</svg>
								) : (
									<svg
										width="17"
										height="17"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.8"
									>
										<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
								)}
							</button>
						</div>
						<FieldError message={state.errors.password} />
					</label>

					{mode === "signup" && (
						<div className="flex flex-col gap-1.5">
							<div className="flex gap-1.5">
								{[0, 1, 2, 3].map((i) => (
									<span
										key={i}
										className={`h-1.5 flex-1 rounded-full ${
											i >= strength ? "bg-bg-muted" : strength >= 3 ? "bg-ok" : "bg-warn"
										}`}
									/>
								))}
							</div>
							{signUpPassword.length > 0 && (
								<span className="text-[11.5px] text-fg-subtle">
									{strength >= 3 ? "Надійний пароль" : "Додай велику літеру, цифру або символ"}
								</span>
							)}
						</div>
					)}

					<button
						type="submit"
						disabled={isPending}
						className={buttonVariants({ size: "lg", className: "mt-1 w-full" })}
					>
						{isPending ? "Перевіряємо…" : mode === "signin" ? "Увійти" : "Зареєструватись"}
					</button>
				</form>

				<div className="flex items-center gap-3">
					<span className="h-px flex-1 bg-border" />
					<span className="font-mono text-[11px] text-fg-subtle">або</span>
					<span className="h-px flex-1 bg-border" />
				</div>

				<div className="flex flex-col gap-2.5">
					<button
						type="button"
						disabled
						aria-disabled
						className="flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-control border border-border bg-bg-subtle text-[13px] font-medium text-fg-subtle opacity-60"
					>
						GitHub
					</button>
					<button
						type="button"
						disabled
						aria-disabled
						className="flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-control border border-border bg-bg-subtle text-[13px] font-medium text-fg-subtle opacity-60"
					>
						Google
					</button>
				</div>
				<p className="text-center text-[11px] text-fg-subtle">
					OAuth — поза скоупом епізоду (тут власний JWT-flow), кнопки декоративні.
				</p>
			</div>
		</div>
	);
}
