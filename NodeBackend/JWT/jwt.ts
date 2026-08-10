// jwt.ts — Node/Backend #3 (JWT)
// Мінімальна ручна реалізація decode/verify - достатньо, щоб показати
// що header/payload - це просто base64(JSON), а безпека залежить
// виключно від того, чи бібліотека фіксує дозволені algorithms.

import { JwtHeader, JwtPayload, VerifyResult } from "./types";

const SECRET = "demo-secret";
const ALLOWED_ALGORITHMS = ["HS256"];

function base64urlEncode(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode<T>(str: string): T {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(padded));
}

// Дуже спрощений "HMAC" тільки для демо - реальний jsonwebtoken використовує crypto.
function fakeSign(data: string, secret: string): string {
  let hash = 0;
  for (const ch of data + secret) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash.toString(16);
}

export function issueToken(payload: JwtPayload): string {
  const header: JwtHeader = { alg: "HS256", typ: "JWT" };
  const h = base64urlEncode(header);
  const p = base64urlEncode(payload);
  const sig = fakeSign(`${h}.${p}`, SECRET);
  return `${h}.${p}.${sig}`;
}

// Токен, підроблений "атакером" - header каже alg: none, підпис - порожній.
export function forgeNoneAlgToken(payload: JwtPayload): string {
  const header = { alg: "none", typ: "JWT" };
  const h = base64urlEncode(header);
  const p = base64urlEncode(payload);
  return `${h}.${p}.`; // порожній signature - формально валідний вигляд
}

export function decode(token: string): { header: JwtHeader; payload: JwtPayload } {
  const [h, p] = token.split(".");
  return { header: base64urlDecode<JwtHeader>(h), payload: base64urlDecode<JwtPayload>(p) };
}

// "Небезпечний" verify - не перевіряє header.alg взагалі.
export function verifyUnsafe(token: string): VerifyResult {
  const { header, payload } = decode(token);
  const [h, p, sig] = token.split(".");
  if (header.alg === "none") {
    // приймає навіть без підпису - ось і вся дірка
    return { ok: true, payload };
  }
  const expected = fakeSign(`${h}.${p}`, SECRET);
  if (sig !== expected) return { ok: false, reason: "invalid signature" };
  return { ok: true, payload };
}

// Безпечний verify - явно дозволяє тільки HS256.
export function verifySafe(token: string): VerifyResult {
  const { header, payload } = decode(token);
  if (!ALLOWED_ALGORITHMS.includes(header.alg)) {
    return { ok: false, reason: `algorithm "${header.alg}" not allowed` };
  }
  const [h, p, sig] = token.split(".");
  const expected = fakeSign(`${h}.${p}`, SECRET);
  if (sig !== expected) return { ok: false, reason: "invalid signature" };
  return { ok: true, payload };
}
