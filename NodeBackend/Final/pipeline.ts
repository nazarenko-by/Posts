// pipeline.ts — Node/Backend Фінал 6/6 (капстоун)
// Один маршрут, що реально проходить усі кроки серії:
// #1/#2 request lifecycle -> #3 JWT (authenticate) -> #4/#5 Prisma-подібний include (без N+1).

import { AuthResult, StepLog, PipelineResult } from "./types";

const USERS = [
  { id: 1, email: "ann@example.com", posts: [{ id: 1, title: "Hello" }, { id: 2, title: "World" }] },
];

// #3 - спрощена перевірка токена (як у verifySafe з поста 155).
function authenticate(token: string): AuthResult {
  if (token === "valid-token") return { ok: true, userId: 1 };
  return { ok: false, reason: "invalid or missing token" };
}

// #4/#5 - findMany({ include }) замість циклу з N+1 запитами.
function findUsersWithPosts() {
  return USERS; // posts вже включені - один "запит", не N+1
}

export function runPipeline(token: string): PipelineResult {
  const steps: StepLog[] = [];

  // #1/#2 - запит прийшов, middleware вже спарсив body/headers (тут - спрощено).
  steps.push({ step: "request", detail: "GET /api/users прийнято", ok: true });

  // #3 - JWT authenticate middleware.
  const auth = authenticate(token);
  steps.push({
    step: "authenticate",
    detail: auth.ok ? `токен валідний, userId=${auth.userId}` : `відхилено: ${auth.reason}`,
    ok: auth.ok,
  });
  if (!auth.ok) {
    return { steps, status: 401, body: { error: auth.reason } };
  }

  // #4/#5 - Prisma include замість наївного циклу.
  const users = findUsersWithPosts();
  steps.push({ step: "prisma.findMany(include)", detail: "1 запит, без N+1", ok: true });

  return { steps, status: 200, body: users };
}
