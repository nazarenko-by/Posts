// db.ts — Node/Backend #5 (Prisma)
// Дві версії того самого пошуку: сирий SQL (typo в назві поля мовчки
// повертає []) і типізований client (typo - помилка ще до виконання,
// бо перевіряється проти реальних полів моделі).

import { User, RawResult, TypedResult } from "./types";

const USERS: User[] = [
  { id: 1, email: "ann@example.com", name: "Ann" },
  { id: 2, email: "bo@example.com", name: "Bo" },
];

// Реальні поля моделі User - те, що згенерував би Prisma Client з schema.prisma.
const USER_FIELDS = ["id", "email", "name"] as const;
type UserField = (typeof USER_FIELDS)[number];

// Сирий SQL - "WHERE <field> = $1". Якщо field з typo, база просто
// не знаходить збігів і повертає порожній масив, без жодної помилки.
export function rawQuery(field: string, value: string): RawResult {
  if (!USER_FIELDS.includes(field as UserField)) {
    // насправді СУБД тут кине помилку "column does not exist",
    // але якщо назва просто НЕ ТОЙ existing стовпець - мовчки [].
    return { rows: [] };
  }
  const rows = USERS.filter((u) => (u as any)[field] === value);
  return { rows };
}

// Типізований client - field перевіряється проти UserField ще на етапі типів.
export function typedQuery(field: UserField, value: string): TypedResult {
  const user = USERS.find((u) => u[field] === value);
  if (!user) return { ok: false, error: "not found" };
  return { ok: true, user };
}

export { USER_FIELDS };
export type { UserField };
