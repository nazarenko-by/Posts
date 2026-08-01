// checklist.ts — Code review #4
// Той самий чек-лист, що і в ReviewChecklistViz - у вигляді даних + функції вердикту.
// Форма PR перевіряється першою: якщо вона не пройшла, до логіки (readability/reliability) не заглиблюємось.

import { ChecklistItem, ChecklistGroup } from "./types";

export const CHECKLIST: ChecklistItem[] = [
  { id: "desc", text: "Опис відповідає діффу", group: "form" },
  { id: "size", text: "Розмір PR - не більше ~400 рядків", group: "form" },
  { id: "title", text: "Назва конкретна, не \"fix\"", group: "form" },
  { id: "naming", text: "Назви змінних логічні", group: "readability" },
  { id: "magic", text: "Немає magic numbers і зайвої складності", group: "readability" },
  { id: "style", text: "Стиль збігається з проєктом", group: "readability" },
  { id: "edge", text: "Порожній масив / null враховано", group: "reliability" },
  { id: "errors", text: "Є try/catch на мережевих запитах", group: "reliability" },
];

export const GROUP_LABELS: Record<ChecklistGroup, string> = {
  form: "Форма PR",
  readability: "Читабельність",
  reliability: "Надійність",
};

function groupDone(group: ChecklistGroup, checked: Set<string>): boolean {
  return CHECKLIST.filter((i) => i.group === group).every((i) => checked.has(i.id));
}

export function getVerdict(checked: Set<string>): string {
  if (!groupDone("form", checked)) {
    return "⛔ Розбий PR на менші - логіку ще не дивлюсь";
  }
  if (checked.size === CHECKLIST.length) {
    return "✅ Готово до approve";
  }
  if (!groupDone("readability", checked)) {
    return "🔎 Читабельність ще не перевірена";
  }
  return "🔎 Лишилась надійність - edge cases, error handling";
}
