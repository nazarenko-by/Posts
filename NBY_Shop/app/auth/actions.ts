"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, checkRateLimit } from "@/lib/auth";
import { signUpSchema, signInSchema, type AuthState } from "@/lib/auth-schema";

// Епізод 14 — реєстрація/вхід. Пароль ніколи не зберігається сирим —
// bcrypt.hash (10 раундів — стандартний баланс швидкість/безпека для
// демо-навантаження) на реєстрації, bcrypt.compare на вході. Сесія —
// httpOnly-кука з власним JWT (lib/auth.ts createSession), не NextAuth.

function safeCallbackUrl(value: FormDataEntryValue | null): string {
	// Захист від open redirect: приймаємо лише внутрішні шляхи, що
	// починаються з "/" і не є protocol-relative "//evil.com".
	if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
		return value;
	}
	return "/account";
}

export async function signUp(_prevState: AuthState, formData: FormData): Promise<AuthState> {
	const raw = {
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
	};

	const parsed = signUpSchema.safeParse(raw);
	if (!parsed.success) {
		const errors: AuthState["errors"] = {};
		for (const issue of parsed.error.issues) {
			const field = issue.path[0] as keyof AuthState["errors"];
			if (!errors[field]) errors[field] = issue.message;
		}
		return { status: "invalid", errors };
	}

	const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
	if (existing) {
		return { status: "invalid", errors: { email: "Такий email вже зареєстровано" } };
	}

	const passwordHash = await bcrypt.hash(parsed.data.password, 10);
	const user = await prisma.user.create({
		data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
	});

	await createSession(user.id);
	redirect(safeCallbackUrl(formData.get("callbackUrl")));
}

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
	const raw = { email: formData.get("email"), password: formData.get("password") };

	const parsed = signInSchema.safeParse(raw);
	if (!parsed.success) {
		const errors: AuthState["errors"] = {};
		for (const issue of parsed.error.issues) {
			const field = issue.path[0] as keyof AuthState["errors"];
			if (!errors[field]) errors[field] = issue.message;
		}
		return { status: "invalid", errors };
	}

	if (!checkRateLimit(parsed.data.email)) {
		return {
			status: "error",
			errors: { form: "Забагато спроб входу. Спробуй ще раз за 10 хвилин (rate limit: 5 спроб / 10 хв)." },
		};
	}

	const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
	const validPassword = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;

	if (!user || !validPassword) {
		// Однакове повідомлення для "нема юзера" і "невірний пароль" — не
		// підказуємо зловмиснику, чи email взагалі зареєстрований.
		return { status: "error", errors: { form: "Невірний email або пароль" } };
	}

	await createSession(user.id);
	redirect(safeCallbackUrl(formData.get("callbackUrl")));
}

export async function signOutAction() {
	await destroySession();
	redirect("/");
}
