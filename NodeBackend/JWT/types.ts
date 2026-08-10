// types.ts — Node/Backend #3 (JWT)

export type JwtHeader = { alg: string; typ: string };
export type JwtPayload = { sub: string; role: string; exp: number };

export type VerifyResult =
  | { ok: true; payload: JwtPayload }
  | { ok: false; reason: string };
