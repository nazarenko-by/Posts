import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { data, COLORS } from "./data.js";

const W = 760;
const H = 520;
const GAP = 6;

export default function Treemap() {
  const [t, setT] = useState(0);

  // «дихання» значень — treemap перелаштовується в loop
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const leaves = useMemo(() => {
    const live = {
      ...data,
      children: data.children.map((d, i) => ({
        ...d,
        value: d.value * (1 + 0.28 * Math.sin(t * 1.4 + i * 1.7)),
      })),
    };

    // 1. ієрархія + сума значень
    const root = d3
      .hierarchy(live)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    // 2. розкладка у прямокутники
    d3.treemap().size([W, H]).padding(GAP / 2)(root);

    return root.leaves();
  }, [t]);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {leaves.map((n) => {
        const idx = data.children.findIndex((d) => d.name === n.data.name);
        const w = n.x1 - n.x0;
        const h = n.y1 - n.y0;
        return (
          <g key={n.data.name} transform={`translate(${n.x0},${n.y0})`}>
            <rect width={w} height={h} rx={14} fill={COLORS[idx % COLORS.length]} fillOpacity={0.9} />
            <text x={16} y={36} fontFamily="Montserrat, sans-serif" fontWeight={800}
              fontSize={Math.min(30, w / 5)} fill="#0a0d14">
              {n.data.name}
            </text>
            <text x={16} y={62} fontFamily="'JetBrains Mono', monospace" fontWeight={700}
              fontSize={20} fill="#0a0d14" fillOpacity={0.7}>
              {Math.round(n.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
