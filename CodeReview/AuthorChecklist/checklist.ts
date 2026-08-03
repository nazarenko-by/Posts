// checklist.ts — Code review #5 (Фінал)
// 5 пунктів, що зібрали весь Code review серії (#1-#4) в один чек-лист автора PR.

import { ChecklistItem } from "./types";

export const AUTHOR_CHECKLIST: ChecklistItem[] = [
  { id: "naming", text: "Я б зрозумів ці назви, побачивши вперше?" },
  { id: "complexity", text: "Я не переускладнив цю задачу?" },
  { id: "edge", text: "Що станеться на порожніх даних чи мережевій помилці?" },
  { id: "desc", text: "Опис PR пояснює навіщо, а не тільки що?" },
  { id: "size", text: "PR можна розбити на менші?" },
];

export function getVerdict(checked: Set<string>): string {
  const total = AUTHOR_CHECKLIST.length;
  if (checked.size === total) return "✅ Готовий до Request review";
  if (checked.size >= total - 2) return "🟡 Майже готовий - лишилось кілька пунктів";
  return "🔎 Ще є над чим подумати перед review";
}
