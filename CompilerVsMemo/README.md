# CompilerVsMemo

Чи потрібен `useMemo`, коли є React Compiler? Один застосунок (5000 товарів, фільтр і сортування, 200 карток) збирається в чотирьох варіантах. Потім у headless Chromium міряється, скільки разів перемальовуються картки і скільки часу працює React.

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #235 · папка `CompilerVsMemo`

## Запуск

```bash
npm i
npm run dev            # без мемоізації (живий лічильник рендерів унизу праворуч)
npm run dev:compiler   # той самий код через React Compiler
npm run dev:manual     # useMemo + memo + useCallback руками
npm run bench          # 4 збірки + заміри → results.json
```

## Варіанти

| варіант | код | компілятор |
|---|---|---|
| `plain` | [`src/plain/App.jsx`](src/plain/App.jsx): без мемоізації | ні |
| `manual` | [`src/manual/App.jsx`](src/manual/App.jsx): `useMemo` для списку, `memo` для картки й списку, `useCallback` | ні |
| `plain+compiler` | той самий `src/plain/App.jsx` | `babel-plugin-react-compiler` |
| `manual+compiler` | `src/manual/App.jsx` | `babel-plugin-react-compiler` |

Збирається в production, `react-dom/client` → `react-dom/profiling`, щоб `<Profiler>` віддавав `actualDuration`. Рендери карток рахуються через `onRender` вкладеного `<Profiler>`, а не мутацією змінної в render: компілятор пропускає компоненти з побічними ефектами в render.

## Результат (07.11.2026)

React 19.3.1, babel-plugin-react-compiler 1.0.0, Vite 8.3.6, @vitejs/plugin-react 6.2.1. Headless Chromium 153, CPU уповільнений ×4, медіана з 3 запусків.

**20 символів у полі «нотатка»** (список від нього не залежить):

| варіант | рендерів карток | час React |
|---|---|---|
| без мемоізації | 4000 | 626,9 ms (31 ms на літеру) |
| useMemo руками | 0 | 5,0 ms |
| React Compiler | 0 | 4,5 ms |
| руками + Compiler | 0 | 6,0 ms |

**10 кліків «у кошик»:** 2000 / 74,7 ms · 0 / 2,3 · 0 / 1,5 · 0 / 3,6.

**«react» у пошуку** (список мусить перерахуватись): 35–50 ms у всіх варіантів, різниця в межах шуму. Карток перемальовується 1000 без мемоізації і 175 з нею (лише ті, що змінились).

**JS gzip:** 72,6 / 72,7 / 73,5 / 73,5 KB. Компілятор додає +0,9 KB: рантайм `react/compiler-runtime` і кеш у компонентах.

## Висновок

- Компілятор дає той самий результат, що й ручні `useMemo` + `memo` + `useCallback`, на коді без жодного рядка мемоізації. Навіть інлайн-стрілка `onClick={() => onAdd(product.id)}` не ламає кешування.
- Ручний `useMemo` поверх компілятора нічого не додає.
- Старий код не чисть наосліп. Компілятор пропускає компоненти, що порушують правила React, і це видно в `eslint-plugin-react-hooks`. `useMemo` лишається інструментом, коли треба точно контролювати залежності ефекту.

## Файли

- `src/plain/App.jsx`, `src/manual/App.jsx` — два варіанти коду
- `src/data.js` — 5000 детермінованих товарів; `src/stats.js` — лічильники для `<Profiler>`
- `vite.config.js` — `VARIANT` / `COMPILER`, alias на `react-dom/profiling`
- `scripts/build.mjs` — 4 збірки; `scripts/bench.mjs` — сценарії в Playwright, `results.json`

---

EN: Same app in 4 builds (plain / manual memo / plain + React Compiler / manual + Compiler). Typing 20 chars into an unrelated field: 4000 card re-renders and 627 ms without memoization; 0 renders and ~5 ms with manual memo, with the compiler, or both. The compiler costs +0.9 KB gzip. `npm i && npm run bench`.
