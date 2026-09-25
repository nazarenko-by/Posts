import { createHmac, timingSafeEqual } from "node:crypto";

// Епізод 14 — "власний JWT" з теми поста (не NextAuth). Підхоплює пост #155
// (Node/Backend #3, "JWT авторизація без магії"): той демо мав verifyUnsafe
// (довіряє alg із заголовка токена — класична атака alg:"none"/alg confusion)
// поруч з verifySafe (явний allowlist алгоритмів). Тут — лише "safe"-варіант,
// застосований у реальному коді, а не в ізольованому демо.
//
// Мінімальний HMAC-SHA256 (HS256) JWT без сторонніх бібліотек: header.payload
// підписуються разом, підпис звіряється constant-time (timingSafeEqual) —
// звичайне `===` на підписах відкриває timing-атаку.

const ALG = "HS256" as const;

export type JwtPayload = {
	sub: string;
	iat: number;
	exp: number;
};

function base64url(input: Buffer): string {
	return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input: string): Buffer {
	const padded = input
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.padEnd(Math.ceil(input.length / 4) * 4, "=");
	return Buffer.from(padded, "base64");
}

function sign(headerAndPayload: string, secret: string): Buffer {
	return createHmac("sha256", secret).update(headerAndPayload).digest();
}

export function signJwt(payload: { sub: string }, secret: string, ttlSeconds: number): string {
	const now = Math.floor(Date.now() / 1000);
	const header = { alg: ALG, typ: "JWT" };
	const fullPayload: JwtPayload = { sub: payload.sub, iat: now, exp: now + ttlSeconds };

	const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
	const encodedPayload = base64url(Buffer.from(JSON.stringify(fullPayload)));
	const signature = base64url(sign(`${encodedHeader}.${encodedPayload}`, secret));

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload | null {
	const parts = token.split(".");
	if (parts.length !== 3) return null;
	const [encodedHeader, encodedPayload, encodedSignature] = parts;

	let header: { alg?: string };
	try {
		header = JSON.parse(base64urlDecode(encodedHeader).toString("utf8"));
	} catch {
		return null;
	}

	// Урок з посту 155, застосований тут по-справжньому: явний allowlist, а
	// не "довіряти alg із заголовка". Токен з alg:"none" чи будь-яким іншим
	// алгоритмом відхиляється ще ДО спроби перевірки підпису.
	if (header.alg !== ALG) return null;

	const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`, secret);
	const actualSignature = base64urlDecode(encodedSignature);
	if (expectedSignature.length !== actualSignature.length || !timingSafeEqual(expectedSignature, actualSignature)) {
		return null;
	}

	let payload: JwtPayload;
	try {
		payload = JSON.parse(base64urlDecode(encodedPayload).toString("utf8"));
	} catch {
		return null;
	}

	if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
		return null;
	}

	return payload;
}
