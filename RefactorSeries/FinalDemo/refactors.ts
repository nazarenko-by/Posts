// refactors.ts — Рефакторинг живого коду #6 (Фінал)
// Звичайне (не-Remotion) демо: shared types + decision helper
// showcasing всі 5 рефакторингів серії в одному міні-проєкті.

export type RefactorName =
  | "composition"
  | "customHook"
  | "compositionSlot"
  | "lookup"
  | "memoCallback";

export interface RefactorInfo {
  id: RefactorName;
  name: string;
  useWhen: string;
  fixes: string;
}

export const REFACTORS: RefactorInfo[] = [
  {
    id: "composition",
    name: "Composition",
    useWhen: "Один компонент робить усе - фетчинг, фільтри, модалку, пагінацію",
    fixes: "God-компонент -> набір дрібних компонентів з чіткою відповідальністю",
  },
  {
    id: "customHook",
    name: "Custom Hook",
    useWhen: "Кілька useEffect в одному компоненті, ніхто не пам'ятає який за що",
    fixes: "useEffect-спагеті -> іменовані хуки (useDashboardData, useInterval, ...)",
  },
  {
    id: "compositionSlot",
    name: "Composition-слот",
    useWhen: "Пропс проходить крізь компоненти, які самі його не використовують",
    fixes: "prop drilling -> children/слот, проміжні компоненти нічого не знають про дані",
  },
  {
    id: "lookup",
    name: "Lookup-об'єкт",
    useWhen: "Вкладений тернарник з більш ніж одним рівнем розгалуження",
    fixes: "тернарник-матрьошка -> плаский об'єкт-довідник, один рядок на варіант",
  },
  {
    id: "memoCallback",
    name: "useCallback / memo",
    useWhen: "Дочірній компонент рендериться заново без зміни своїх даних",
    fixes: "нестабільні inline-функції -> useCallback/useMemo, React.memo реально працює",
  },
];

/**
 * Проста decision-функція: за симптомами коду підказує потрібний рефакторинг.
 * Навчальний хелпер для демо, не production-код.
 */
export function suggestRefactor(symptoms: {
  doesEverything?: boolean;
  tooManyEffects?: boolean;
  unusedPropForwarding?: boolean;
  nestedTernary?: boolean;
  rerendersWithoutReason?: boolean;
}): RefactorInfo {
  if (symptoms.doesEverything) return REFACTORS.find((r) => r.id === "composition")!;
  if (symptoms.tooManyEffects) return REFACTORS.find((r) => r.id === "customHook")!;
  if (symptoms.unusedPropForwarding) return REFACTORS.find((r) => r.id === "compositionSlot")!;
  if (symptoms.nestedTernary) return REFACTORS.find((r) => r.id === "lookup")!;
  if (symptoms.rerendersWithoutReason) return REFACTORS.find((r) => r.id === "memoCallback")!;
  return REFACTORS[0];
}
