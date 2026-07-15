// useUser.ts — Рефакторинг живого коду #3
// Мок-хук: в реальному проєкті тут був би фетчинг/контекст авторизації.

import { User } from "./types";

export function useUser(): User {
  return { name: "Богдан", role: "frontend" };
}
