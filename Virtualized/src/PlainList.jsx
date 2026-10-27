// ❌ Звичайний список: усі 100 000 рядків одразу в DOM
import { rows } from "./rows.js";
import { Row } from "./Row.jsx";

export function PlainList({ scrollRef }) {
  return (
    <div className="viewport" ref={scrollRef}>
      {rows.map((row) => <Row key={row.id} row={row} />)}
    </div>
  );
}
