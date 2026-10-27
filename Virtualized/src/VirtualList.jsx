// ✅ Віртуалізація: у DOM лише рядки, що видно у вікні, + overscan
import { useVirtualizer } from "@tanstack/react-virtual";
import { rows, ROW_HEIGHT } from "./rows.js";
import { Row } from "./Row.jsx";

export function VirtualList({ scrollRef }) {
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div className="viewport" ref={scrollRef}>
      {/* «розпірка» на повну висоту, щоб скролбар був як у 100 000 рядків */}
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((v) => (
          <Row
            key={v.key}
            row={rows[v.index]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${v.start}px)` }}
          />
        ))}
      </div>
    </div>
  );
}
