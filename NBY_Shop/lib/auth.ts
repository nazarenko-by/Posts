import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signJwt, verifyJwt } from "@/lib/jwt";

// Епізод 14 — сесія: httpOnly-кука з власним JWT (lib/jwt.ts), 30 днів.
// httpOnly — недоступна з document.cookie (XSS не вкраде токен напряму),
// sameSite:"lax" — не летить у сторонніх cross-site POST-запитах.
const SESSION_COOKIE = "nby_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSecret(): string {
	const secret = process.env.AUTH_SECRET;
	if (secret) return secret;
	// Демо-фолбек — у реальному проєкті відсутність AUTH_SECRET мала б валити
	// старт застосунку, а не тихо підставляти дефолт. Явний коментар, щоб не
	// пропустити це при перенесенні за межі навчальної пісочниці.
	return "nby-shop-dev-secret-change-me";
}

export async function createSession(userId: string) {
	const token = signJwt({ sub: userId }, getSecret(), SESSION_TTL_SECONDS);
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_TTL_SECONDS,
	});
}

export async function destroySession() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE)?.value;
	if (!token) return null;

	const payload = verifyJwt(token, getSecret());
	if (!payload) return null;

	return prisma.user.findUnique({ where: { id: payload.sub } });
}

// Rate limit — кіт (COMPONENTS.md → s_auth) дає точну цифру просто в копірайті
// error-стану: "rate limit: 5 {{ t.attempts }} / 10 min". In-memory Map — живе
// лише в пам'яті одного процесу (переживе рестарт/масштабування гірше за
// Redis чи БД-лічильник), але контракт той самий: перевірка перед кожною
// спробою, вікно скидається через 10 хв від першої спроби в ньому.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(email: string): boolean {
	const now = Date.now();
	const entry = loginAttempts.get(email);

	if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
		loginAttempts.set(email, { count: 1, windowStart: now });
		return true;
	}

	if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) return false;

	entry.count += 1;
	return true;
}
