import { z } from "zod";

// Епізод 14 — той самий підхід, що checkout-schema.ts (епізод 11): Zod-схема
// й тип стану окремо від app/auth/actions.ts ("use server" дозволяє
// експортувати лише async-функції).

export const signUpSchema = z.object({
	name: z.string().trim().min(2, "Мінімум 2 символи"),
	email: z.string().trim().toLowerCase().email("Некоректний email"),
	password: z.string().min(8, "Мінімум 8 символів"),
});

export const signInSchema = z.object({
	email: z.string().trim().toLowerCase().email("Некоректний email"),
	password: z.string().min(1, "Введи пароль"),
});

export type AuthFields = "name" | "email" | "password" | "form";

export type AuthState = {
	status: "idle" | "invalid" | "error";
	errors: Partial<Record<AuthFields, string>>;
};

export const initialAuthState: AuthState = { status: "idle", errors: {} };
