// ❌ Похідні дані в state + useEffect: кожен ефект - ще один рендер
import { useEffect, useRef, useState } from "react";
import { PACKAGES } from "./packages.js";
import { useCommit } from "./tracker.js";
import { isConsistent, matches } from "./matches.js";

export function SearchEffect({ query }) {
  const [filtered, setFiltered] = useState(PACKAGES);
  const [count, setCount] = useState(PACKAGES.length);

  useEffect(() => {
    setFiltered(PACKAGES.filter((p) => matches(p, query)));
  }, [query]);

  useEffect(() => {
    setCount(filtered.length);
  }, [filtered]);

  const ref = useRef(null);
  useCommit("effect", isConsistent(query, filtered, count), ref);

  return <Result ref={ref} count={count} list={filtered} />;
}

export function Result({ ref, count, list }) {
  return (
    <div className="result" ref={ref}>
      <p className="count">знайдено: <b>{count}</b></p>
      <ul>{list.slice(0, 8).map((p) => <li key={p}>{p}</li>)}</ul>
      {list.length > 8 && <p className="more">+ ще {list.length - 8}</p>}
    </div>
  );
}
