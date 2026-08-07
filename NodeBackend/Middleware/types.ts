// types.ts — Node/Backend #2 (Request lifecycle)

export type Body = { name?: string };

export type ServerResult =
  | { crashed: true; message: string }
  | { crashed: false; status: number; body: unknown };
