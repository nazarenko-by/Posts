// ✅ Похідні дані рахуються прямо в render: один рендер, жодних проміжних станів
import { useRef } from "react";
import { PACKAGES } from "./packages.js";
import { useCommit } from "./tracker.js";
import { isConsistent, matches } from "./matches.js";
import { Result } from "./SearchEffect.jsx";

export function SearchRender({ query }) {
  const filtered = PACKAGES.filter((p) => matches(p, query));
  const count = filtered.length;

  const ref = useRef(null);
  useCommit("render", isConsistent(query, filtered, count), ref);
  return <Result ref={ref} count={count} list={filtered} />;
}
