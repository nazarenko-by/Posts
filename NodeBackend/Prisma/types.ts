// types.ts — Node/Backend #5 (Prisma)

export type User = { id: number; email: string; name: string };

export type RawResult = { rows: User[] };

export type TypedResult =
  | { ok: true; user: User }
  | { ok: false; error: string };
