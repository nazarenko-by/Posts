import { useLayoutEffect, useRef, useState } from "react";
import { PlainList } from "./PlainList.jsx";
import { VirtualList } from "./VirtualList.jsx";
import { ROW_COUNT } from "./rows.js";
import { afterPaint, countNodes, mountStart, scrollBench } from "./measure.js";

// режим у URL: ?mode=plain | ?mode=virtual - кожен замір у свіжій сторінці
const mode = new URLSearchParams(location.search).get("mode") === "plain" ? "plain" : "virtual";

export function App() {
  const scrollRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [scroll, setScroll] = useState(null);

  useLayoutEffect(() => {
    afterPaint().then(() => {
      const s = {
        mode,
        mountMs: Math.round(performance.now() - mountStart),
        nodes: countNodes(scrollRef.current),
        heapMb: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
      };
      window.__mount = s;
      setStats(s);
    });
  }, []);

  async function runScroll() {
    setScroll("…");
    const r = await scrollBench(scrollRef.current);
    window.__scroll = r;
    setScroll(r);
  }

  const List = mode === "plain" ? PlainList : VirtualList;
  return (
    <main>
      <h1>Virtualized <span>· {ROW_COUNT.toLocaleString("uk-UA")} рядків</span></h1>
      <nav className="modes">
        <a href="?mode=virtual" aria-current={mode === "virtual" ? "page" : undefined}>віртуалізований</a>
        <a href="?mode=plain" aria-current={mode === "plain" ? "page" : undefined}>звичайний</a>
      </nav>
      <div className="stats">
        <div><b>{stats ? stats.nodes.toLocaleString("uk-UA") : "…"}</b><span>вузлів DOM у списку</span></div>
        <div><b>{stats ? `${stats.mountMs} ms` : "…"}</b><span>до першого кадру</span></div>
        <div><b>{stats?.heapMb != null ? `${stats.heapMb} MB` : "—"}</b><span>JS heap</span></div>
        <div>
          <b>{scroll && scroll !== "…" ? `${scroll.fps} fps` : scroll || "—"}</b>
          <span>{scroll && scroll !== "…" ? `прокрутка, найгірший кадр ${scroll.worstMs} ms` : <button onClick={runScroll}>тест прокрутки</button>}</span>
        </div>
      </div>
      <List scrollRef={scrollRef} />
    </main>
  );
}
