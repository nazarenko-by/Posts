import { ROW_HEIGHT } from "./rows.js";

// один рядок: 5 DOM-вузлів (div + 4 span)
export function Row({ row, style }) {
  return (
    <div className="row" style={{ height: ROW_HEIGHT, ...style }}>
      <span className="id">#{row.id}</span>
      <span className={`lvl ${row.level}`}>{row.level}</span>
      <span className="svc">{row.service}</span>
      <span className="ms">{row.ms} ms</span>
    </div>
  );
}
