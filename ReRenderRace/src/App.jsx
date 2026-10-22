import { useEffect, useRef } from "react";
import { makeTree } from "./Tree.jsx";
import { ContextStore, contextHooks } from "./stores/context.jsx";
import { zustandHooks } from "./stores/zustand.js";
import { ReduxStore, reduxHooks } from "./stores/redux.jsx";
import { arm, detail, reset, useTotals } from "./tracker.js";

// у консолі: __renders() - хто скільки разів ре-рендерився
window.__renders = detail;

const ContextShop = makeTree("context", contextHooks);
const ZustandShop = makeTree("zustand", zustandHooks);
const ReduxShop = makeTree("redux", reduxHooks);

const COLUMNS = [
  { key: "zustand", title: "Zustand", el: <ZustandShop /> },
  { key: "redux", title: "Redux Toolkit", el: <ReduxStore><ReduxShop /></ReduxStore> },
  { key: "context", title: "Context", el: <ContextStore><ContextShop /></ContextStore> },
];

export function App() {
  const totals = useTotals();
  const cols = useRef({});
  useEffect(() => { arm(); }, []);

  // одна й та сама дія в усіх трьох деревах: клікаємо відповідну кнопку в кожній колонці
  const everywhere = (action) => {
    for (const c of COLUMNS) cols.current[c.key]?.querySelector(`[data-action="${action}"]`)?.click();
  };

  return (
    <main>
      <h1>ReRenderRace <span>· хто перемальовує зайве</span></h1>
      <p className="hint">Одне дерево з 13 компонентів, три способи зберігати стан. Вузол спалахує, коли компонент ре-рендериться.</p>
      <div className="controls">
        <button onClick={() => everywhere("add")}>+1 у кошик (усім)</button>
        <button onClick={() => everywhere("theme")}>змінити тему (усім)</button>
        <button className="ghost" onClick={reset}>скинути лічильники</button>
      </div>
      <div className="cols">
        {COLUMNS.map((c) => (
          <section key={c.key} className={`col ${c.key}`} ref={(el) => (cols.current[c.key] = el)}>
            <header>
              <h2>{c.title}</h2>
              <output data-total={c.key}>{totals[c.key]}</output>
            </header>
            {c.el}
          </section>
        ))}
      </div>
    </main>
  );
}
