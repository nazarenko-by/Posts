import { useEffect, useState } from "react";
import { SearchEffect } from "./SearchEffect.jsx";
import { SearchRender } from "./SearchRender.jsx";
import { arm, reset, snapshot, useStats } from "./tracker.js";

// у консолі: __stats() - рендери й «неузгоджені» коміти по варіантах
window.__stats = snapshot;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function App() {
  const [query, setQuery] = useState("");
  useEffect(() => { arm(); }, []);

  // друкує слово по літері, як людина
  async function type(word) {
    setQuery(""); await sleep(50); reset();
    for (let i = 1; i <= word.length; i++) { setQuery(word.slice(0, i)); await sleep(180); }
  }

  const cols = [
    { key: "effect", title: "useEffect + setState", el: <SearchEffect query={query} /> },
    { key: "render", title: "обчислення в render", el: <SearchRender query={query} /> },
  ];

  return (
    <main>
      <h1>UseEffectWaterfall <span>· тобі не потрібен useEffect</span></h1>
      <p className="hint">Один інпут, два списки. Зелений спалах - рендер з актуальними даними, червоний - на екрані старий список або лічильник.</p>
      <div className="controls">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="пошук пакета…" aria-label="Пошук" />
        <button onClick={() => type("react")}>надрукувати «react»</button>
        <button className="ghost" onClick={reset}>скинути</button>
      </div>
      <div className="cols">
        {cols.map((c) => (
          <section key={c.key} className={`col ${c.key}`}>
            <header>
              <h2>{c.title}</h2>
              <Stats variant={c.key} />
            </header>
            {c.el}
          </section>
        ))}
      </div>
    </main>
  );
}

// лічильники - окремий компонент: їх оновлення не перемальовує панелі пошуку
function Stats({ variant }) {
  const stats = useStats();
  return (
    <div className="nums">
      <output data-renders={variant}>{stats[variant].renders}</output> рендерів
      <span className="bad"><output data-stale={variant}>{stats[variant].stale}</output> зі старими даними</span>
    </div>
  );
}
