// useDocumentTitle.ts — Рефакторинг живого коду #2
// Витягнута синхронізація document.title. Одна причина для зміни:
// значення заголовка.

import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
