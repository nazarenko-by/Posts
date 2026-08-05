// server.ts — Node/Backend #1
// Мінімальний in-memory "сервер" - той самий route table, що і в RestApiViz,
// тільки насправді викликається при кліку в демо.

import { Route, ServerResponse, HttpMethod } from "./types";

const USERS = [
  { id: 1, name: "Ann" },
  { id: 2, name: "Bo" },
];

export const ROUTES: Route[] = [
  {
    method: "GET",
    path: "/api/users",
    label: "GET /api/users",
    handler: () => ({ status: 200, body: USERS }),
  },
  {
    method: "POST",
    path: "/api/users",
    label: "POST /api/users",
    handler: () => ({ status: 201, body: { id: 3, name: "New user" } }),
  },
  {
    method: "GET",
    path: "/api/orders",
    label: "GET /api/orders (не існує)",
    handler: () => ({ status: 404, body: { error: "Route not found" } }),
  },
];

// Симулює те, що робить app.get/app.post під капотом - шукає збіг маршруту.
export function handleRequest(method: HttpMethod, path: string): ServerResponse {
  const route = ROUTES.find((r) => r.method === method && r.path === path);
  if (!route) return { status: 404, body: { error: "Route not found" } };
  return route.handler();
}
