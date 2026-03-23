import { useState, useRef, useCallback, useEffect } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", red: "#ff5f57",
};

// ── Spring physics ────────────────────────────────────────────────────────────
function springStep(pos, vel, target, stiffness = 300, damping = 28, dt = 0.016) {
  const force = -stiffness * (pos - target) - damping * vel;
  const newVel = vel + force * dt;
  const newPos = pos + newVel * dt;
  return [newPos, newVel];
}

function useSpringPos(targetX, targetY, stiffness = 300, damping = 28) {
  const state = useRef({ x: targetX, y: targetY, vx: 0, vy: 0 });
  const [pos, setPos] = useState({ x: targetX, y: targetY });
  const raf = useRef(null);
  const tRef = useRef({ x: targetX, y: targetY });

  useEffect(() => { tRef.current = { x: targetX, y: targetY }; }, [targetX, targetY]);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const tick = () => {
      const [nx, nvx] = springStep(state.current.x, state.current.vx, tRef.current.x, stiffness, damping);
      const [ny, nvy] = springStep(state.current.y, state.current.vy, tRef.current.y, stiffness, damping);
      state.current = { x: nx, y: ny, vx: nvx, vy: nvy };
      setPos({ x: nx, y: ny });
      const settled = Math.abs(nx - tRef.current.x) < 0.2 && Math.abs(ny - tRef.current.y) < 0.2
        && Math.abs(nvx) < 0.2 && Math.abs(nvy) < 0.2;
      if (!settled) raf.current = requestAnimationFrame(tick);
      else setPos({ ...tRef.current });
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [targetX, targetY, stiffness, damping]);

  return pos;
}

// ── DEMO 1: Free drag with elastic bounds ─────────────────────────────────────
function FreeDragDemo({ elastic, stiffness, damping }) {
  const boxRef = useRef(null);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const rawPos = useRef({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [targetX, setTargetX] = useState(0);
  const [targetY, setTargetY] = useState(0);
  const [displayX, setDisplayX] = useState(0);
  const [displayY, setDisplayY] = useState(0);
  const [scale, setScale] = useState(1);
  const scaleState = useRef({ v: 1, vel: 0 });
  const rafScale = useRef(null);

  const animateScale = (target) => {
    cancelAnimationFrame(rafScale.current);
    const tick = () => {
      const [nv, nvl] = springStep(scaleState.current.v, scaleState.current.vel, target, 400, 28);
      scaleState.current = { v: nv, vel: nvl };
      setScale(nv);
      if (Math.abs(nv - target) > 0.001 || Math.abs(nvl) > 0.001)
        rafScale.current = requestAnimationFrame(tick);
    };
    rafScale.current = requestAnimationFrame(tick);
  };

  // spring back when released
  const posState = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const posRaf = useRef(null);
  const springToTarget = (tx, ty) => {
    cancelAnimationFrame(posRaf.current);
    const tick = () => {
      const [nx, nvx] = springStep(posState.current.x, posState.current.vx, tx, stiffness, damping);
      const [ny, nvy] = springStep(posState.current.y, posState.current.vy, ty, stiffness, damping);
      posState.current = { x: nx, y: ny, vx: nvx, vy: nvy };
      setDisplayX(nx); setDisplayY(ny);
      const done = Math.abs(nx - tx) < 0.3 && Math.abs(ny - ty) < 0.3 && Math.abs(nvx) < 0.3 && Math.abs(nvy) < 0.3;
      if (!done) posRaf.current = requestAnimationFrame(tick);
      else { setDisplayX(tx); setDisplayY(ty); }
    };
    posRaf.current = requestAnimationFrame(tick);
  };

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    animateScale(1.08);
    cancelAnimationFrame(posRaf.current);
    const rect = e.currentTarget.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 };
    lastPos.current = { x: displayX, y: displayY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [displayX, displayY]);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current || !containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    const bw = 64, bh = 64;
    const maxX = (cr.width - bw) / 2;
    const maxY = (cr.height - bh) / 2;

    const rawX = e.clientX - cr.left - cr.width / 2;
    const rawY = e.clientY - cr.top - cr.height / 2;

    // elastic: clamp with spring-like resistance beyond bounds
    const clampedX = Math.max(-maxX, Math.min(maxX, rawX));
    const clampedY = Math.max(-maxY, Math.min(maxY, rawY));
    const overX = rawX - clampedX;
    const overY = rawY - clampedY;
    const ex = clampedX + overX * elastic;
    const ey = clampedY + overY * elastic;

    velRef.current = { x: ex - lastPos.current.x, y: ey - lastPos.current.y };
    lastPos.current = { x: ex, y: ey };
    posState.current = { x: ex, y: ey, vx: velRef.current.x * 60, vy: velRef.current.y * 60 };
    setDisplayX(ex); setDisplayY(ey);
  }, [elastic]);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    animateScale(1);
    // spring back to 0,0
    springToTarget(0, 0);
  }, [stiffness, damping]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div ref={containerRef} style={{
        width: "100%", height: 180,
        background: C.surface2, borderRadius: 12,
        border: `1px solid ${C.border}`,
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* bounds hint */}
        <div style={{
          position: "absolute", inset: 12,
          border: `1px dashed ${C.border}`,
          borderRadius: 8, opacity: 0.5,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", fontSize: 9, color: C.muted, top: 18, left: 18,
          pointerEvents: "none",
        }}>dragConstraints</div>

        {/* draggable box */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            width: 64, height: 64, borderRadius: 12,
            background: isDragging
              ? `linear-gradient(135deg, ${C.accent}55, ${C.accent}33)`
              : `linear-gradient(135deg, ${C.accent}33, ${C.accent}18)`,
            border: `2px solid ${isDragging ? C.accent : C.accent + "88"}`,
            boxShadow: isDragging ? `0 16px 40px ${C.accent}33` : `0 4px 12px ${C.accent}18`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 3,
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none", touchAction: "none",
            position: "absolute",
            transform: `translate(${displayX}px, ${displayY}px) scale(${scale})`,
            willChange: "transform",
            transition: isDragging ? "border-color 0.15s, box-shadow 0.15s" : "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          <span style={{ fontSize: 18 }}>⊹</span>
          <span style={{ fontSize: 8, color: isDragging ? C.accent : C.muted }}>
            {isDragging ? "dragging" : "drag me"}
          </span>
        </div>
      </div>

      <div style={{ fontSize: 10, color: C.muted, display: "flex", gap: 16 }}>
        <span>elastic: <span style={{ color: C.accent }}>{elastic}</span></span>
        <span>x: <span style={{ color: C.accent }}>{Math.round(displayX)}</span></span>
        <span>y: <span style={{ color: C.accent }}>{Math.round(displayY)}</span></span>
      </div>
    </div>
  );
}

// ── DEMO 2: Axis drag with snap ───────────────────────────────────────────────
const SNAP_POINTS = [-120, -60, 0, 60, 120];
const SNAP_LABELS = ["①", "②", "③", "④", "⑤"];

function AxisDragDemo({ stiffness, damping }) {
  const [snapIdx, setSnapIdx] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startSnap = useRef(2);
  const posState = useRef({ x: 0, vx: 0 });
  const [displayX, setDisplayX] = useState(0);
  const scaleState = useRef({ v: 1, vel: 0 });
  const [scale, setScale] = useState(1);
  const rafPos = useRef(null);
  const rafScale = useRef(null);

  const springX = (tx) => {
    cancelAnimationFrame(rafPos.current);
    const tick = () => {
      const [nx, nvx] = springStep(posState.current.x, posState.current.vx, tx, stiffness, damping);
      posState.current = { x: nx, vx: nvx };
      setDisplayX(nx);
      if (Math.abs(nx - tx) > 0.2 || Math.abs(nvx) > 0.2) rafPos.current = requestAnimationFrame(tick);
      else setDisplayX(tx);
    };
    rafPos.current = requestAnimationFrame(tick);
  };

  const springScale = (tv) => {
    cancelAnimationFrame(rafScale.current);
    const tick = () => {
      const [nv, nvl] = springStep(scaleState.current.v, scaleState.current.vel, tv, 400, 28);
      scaleState.current = { v: nv, vel: nvl };
      setScale(nv);
      if (Math.abs(nv - tv) > 0.001 || Math.abs(nvl) > 0.001) rafScale.current = requestAnimationFrame(tick);
    };
    rafScale.current = requestAnimationFrame(tick);
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    dragging.current = true; setIsDragging(true);
    startX.current = e.clientX;
    startSnap.current = snapIdx;
    posState.current.vx = 0;
    cancelAnimationFrame(rafPos.current);
    springScale(1.1);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    const raw = SNAP_POINTS[startSnap.current] + dx;
    const clamped = Math.max(-140, Math.min(140, raw));
    posState.current.x = clamped;
    setDisplayX(clamped);
  };

  const onPointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false; setIsDragging(false);
    springScale(1);
    // find nearest snap
    const nearest = SNAP_POINTS.reduce((best, p, i) =>
      Math.abs(p - posState.current.x) < Math.abs(SNAP_POINTS[best] - posState.current.x) ? i : best, 0);
    setSnapIdx(nearest);
    springX(SNAP_POINTS[nearest]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {/* track */}
      <div style={{
        width: "100%", height: 100, background: C.surface2,
        borderRadius: 12, border: `1px solid ${C.border}`,
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* track line */}
        <div style={{
          position: "absolute", left: "10%", right: "10%", height: 2,
          background: C.border, borderRadius: 1,
        }} />

        {/* snap point dots */}
        {SNAP_POINTS.map((p, i) => (
          <div key={i} onClick={() => { setSnapIdx(i); springX(p); }} style={{
            position: "absolute",
            left: `calc(50% + ${p}px)`,
            transform: "translate(-50%, 0)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            cursor: "pointer",
          }}>
            <div style={{
              width: i === snapIdx ? 10 : 6, height: i === snapIdx ? 10 : 6,
              borderRadius: "50%",
              background: i === snapIdx ? C.purple : C.muted + "66",
              transition: "all 0.2s",
              boxShadow: i === snapIdx ? `0 0 8px ${C.purple}88` : "none",
            }} />
            <span style={{ fontSize: 9, color: i === snapIdx ? C.purple : C.muted + "88" }}>
              {SNAP_LABELS[i]}
            </span>
          </div>
        ))}

        {/* draggable */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            position: "absolute",
            width: 48, height: 48, borderRadius: 10,
            background: isDragging ? `${C.purple}44` : `${C.purple}22`,
            border: `2px solid ${isDragging ? C.purple : C.purple + "88"}`,
            boxShadow: isDragging ? `0 8px 24px ${C.purple}44` : `0 2px 8px ${C.purple}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none", touchAction: "none",
            transform: `translateX(${displayX}px) scale(${scale})`,
            willChange: "transform",
            fontSize: 18,
          }}
        >⊸</div>
      </div>

      <div style={{ fontSize: 10, color: C.muted, display: "flex", gap: 16 }}>
        <span>snap: <span style={{ color: C.purple }}>{SNAP_LABELS[snapIdx]}</span></span>
        <span>x: <span style={{ color: C.purple }}>{Math.round(displayX)}</span></span>
        <span style={{ color: C.muted + "66" }}>click dots to snap</span>
      </div>
    </div>
  );
}

// ── DEMO 3: Drag to reorder ───────────────────────────────────────────────────
const INIT_ITEMS = [
  { id: 1, label: "Design tokens",  color: C.accent,  icon: "◈" },
  { id: 2, label: "Component API",  color: C.purple,  icon: "◉" },
  { id: 3, label: "Animations",     color: C.green,   icon: "◎" },
  { id: 4, label: "Documentation",  color: C.orange,  icon: "◇" },
  { id: 5, label: "Testing",        color: C.yellow,  icon: "◆" },
];

function ReorderDemo({ stiffness, damping }) {
  const [items, setItems] = useState(INIT_ITEMS);
  const [draggingId, setDraggingId] = useState(null);
  const [dragY, setDragY] = useState(0);
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(INIT_ITEMS.map((it, i) => [it.id, i * 52]))
  );

  const ITEM_H = 52;
  const draggingRef = useRef(null);
  const startY = useRef(0);
  const startPosY = useRef(0);
  const posState = useRef({});
  const velState = useRef({});
  const rafRef = useRef(null);
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // spring all items to their target positions
  const targetPositions = useRef({});
  const animatePositions = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      let anyMoving = false;
      const next = {};
      for (const id of Object.keys(targetPositions.current)) {
        const cur = posState.current[id] ?? targetPositions.current[id];
        const vel = velState.current[id] ?? 0;
        const [np, nv] = springStep(cur, vel, targetPositions.current[id], stiffness * 0.6, damping);
        posState.current[id] = np;
        velState.current[id] = nv;
        next[id] = np;
        if (Math.abs(np - targetPositions.current[id]) > 0.3 || Math.abs(nv) > 0.3) anyMoving = true;
      }
      setPositions({ ...next });
      if (anyMoving) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stiffness, damping]);

  const updateTargetPositions = useCallback((orderedItems, draggingItemId = null, rawY = null) => {
    let idx = 0;
    const targets = {};
    for (const item of orderedItems) {
      if (item.id === draggingItemId) {
        targets[item.id] = rawY ?? idx * ITEM_H;
      } else {
        targets[item.id] = idx * ITEM_H;
      }
      idx++;
    }
    targetPositions.current = targets;
    animatePositions();
  }, [animatePositions]);

  const onPointerDown = useCallback((e, id) => {
    e.preventDefault();
    draggingRef.current = id;
    setDraggingId(id);
    startY.current = e.clientY;
    const curIdx = items.findIndex(it => it.id === id);
    startPosY.current = curIdx * ITEM_H;
    posState.current[id] = startPosY.current;
    velState.current[id] = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [items]);

  const onPointerMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const id = draggingRef.current;
    const dy = e.clientY - startY.current;
    const rawY = startPosY.current + dy;
    const clampedY = Math.max(0, Math.min((items.length - 1) * ITEM_H, rawY));

    // figure out new order
    const newIdx = Math.round(clampedY / ITEM_H);
    const curIdx = itemsRef.current.findIndex(it => it.id === id);
    let newOrder = [...itemsRef.current];
    if (newIdx !== curIdx) {
      const [moved] = newOrder.splice(curIdx, 1);
      newOrder.splice(newIdx, 0, moved);
      setItems(newOrder);
    }

    // set dragging item position directly
    posState.current[id] = clampedY;
    targetPositions.current[id] = clampedY;
    const targets = {};
    let ni = 0;
    for (const item of newOrder) {
      targets[item.id] = item.id === id ? clampedY : ni * ITEM_H;
      if (item.id !== id) ni++;
      else ni++;
    }
    targetPositions.current = targets;
    animatePositions();
  }, [items, animatePositions]);

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    const id = draggingRef.current;
    draggingRef.current = null;
    setDraggingId(null);
    // snap to grid
    const finalIdx = itemsRef.current.findIndex(it => it.id === id);
    targetPositions.current[id] = finalIdx * ITEM_H;
    animatePositions();
  }, [animatePositions]);

  // init positions
  useEffect(() => {
    const targets = Object.fromEntries(items.map((it, i) => [it.id, i * ITEM_H]));
    targetPositions.current = targets;
    items.forEach(it => {
      if (posState.current[it.id] === undefined) posState.current[it.id] = items.findIndex(x => x.id === it.id) * ITEM_H;
      if (velState.current[it.id] === undefined) velState.current[it.id] = 0;
    });
  }, []);

  const totalH = items.length * ITEM_H;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: "100%", position: "relative",
        height: totalH, userSelect: "none",
      }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {items.map((item) => {
          const y = positions[item.id] ?? 0;
          const isDragging = draggingId === item.id;
          return (
            <div
              key={item.id}
              onPointerDown={(e) => onPointerDown(e, item.id)}
              style={{
                position: "absolute", left: 0, right: 0, top: 0,
                height: ITEM_H - 6,
                transform: `translateY(${y}px)`,
                willChange: "transform",
                zIndex: isDragging ? 10 : 1,
                padding: "0 0 6px",
              }}
            >
              <div style={{
                height: "100%", borderRadius: 10,
                background: isDragging ? item.color + "22" : C.surface2,
                border: `1.5px solid ${isDragging ? item.color : C.border}`,
                boxShadow: isDragging ? `0 8px 24px ${item.color}33` : "none",
                display: "flex", alignItems: "center", gap: 10,
                padding: "0 14px",
                cursor: isDragging ? "grabbing" : "grab",
                transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
              }}>
                <span style={{ fontSize: 16, color: item.color }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: isDragging ? item.color : C.text, fontWeight: 600 }}>
                  {item.label}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: isDragging ? item.color : C.muted + "66" }} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: C.muted }}>
        drag to reorder — spring snaps to position
      </div>
    </div>
  );
}

// ── Code snippets ─────────────────────────────────────────────────────────────
const CODES = {
  free: (elastic) => `<motion.div
  drag
  dragConstraints={containerRef}
  dragElastic={${elastic}}
  dragTransition={{
    bounceStiffness: 300,
    bounceDamping: 28,
  }}
  whileDrag={{ scale: 1.08 }}
/>`,
  axis: `<motion.div
  drag="x"
  dragSnapToOrigin={false}
  dragConstraints={{ left: -120, right: 120 }}
  dragElastic={0}
  onDragEnd={(_, info) => {
    // snap to nearest point
    const nearest = snapPoints.reduce((a, b) =>
      Math.abs(b - info.point.x) < Math.abs(a - info.point.x)
        ? b : a
    );
    animate(x, nearest, { type: "spring" });
  }}
/>`,
  reorder: `import { Reorder } from "framer-motion";

<Reorder.Group
  axis="y"
  values={items}
  onReorder={setItems}
>
  {items.map(item => (
    <Reorder.Item key={item.id} value={item}>
      <div className="item">{item.label}</div>
    </Reorder.Item>
  ))}
</Reorder.Group>`,
};

function CodeBlock({ code }) {
  return (
    <pre style={{
      background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "12px 14px", margin: 0,
      fontSize: 10, lineHeight: 1.75,
      fontFamily: "JetBrains Mono, monospace",
      color: C.muted, overflowX: "auto", whiteSpace: "pre",
    }}>
      {code.split("\n").map((line, i) => (
        <div key={i}>
          {line.split(/(".*?"|\b\d+\.?\d*\b|motion\.div|Reorder\.Group|Reorder\.Item|drag|dragConstraints|dragElastic|dragTransition|whileDrag|onDragEnd|bounceStiffness|bounceDamping|animate|values|onReorder|axis|key|value)/).map((seg, j) => {
            const color =
              /^"/.test(seg) ? C.green :
              /^\d/.test(seg) ? C.orange :
              ["motion.div","Reorder.Group","Reorder.Item"].includes(seg) ? C.purple :
              ["drag","dragConstraints","dragElastic","dragTransition","whileDrag","onDragEnd","values","onReorder","axis","key","value"].includes(seg) ? C.accent :
              ["bounceStiffness","bounceDamping","animate"].includes(seg) ? C.yellow :
              C.muted;
            return <span key={j} style={{ color }}>{seg}</span>;
          })}
        </div>
      ))}
    </pre>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DragDropDemo() {
  const [demo, setDemo]       = useState("free");
  const [elastic, setElastic] = useState(0.2);
  const [stiffness, setStiffness] = useState(300);
  const [damping, setDamping]     = useState(28);

  const DEMOS = [
    { key: "free",    label: "free drag",    color: C.accent,  desc: "elastic bounds + snap back" },
    { key: "axis",    label: "axis + snap",  color: C.purple,  desc: "drag='x' + snap points" },
    { key: "reorder", label: "reorder",      color: C.green,   desc: "Reorder.Group" },
  ];

  const codeStr = demo === "free" ? CODES.free(elastic) : demo === "axis" ? CODES.axis : CODES.reorder;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "26px 18px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <style>{`
        input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:#2a2c4a;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#c0caf5;border:2px solid #0a0d14;cursor:pointer;transition:transform .15s,background .15s}
        input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.25);background:#7dcfff}
        input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#c0caf5;border:2px solid #0a0d14;cursor:pointer}
      `}</style>

      <div style={{ width: "100%", maxWidth: 680 }}>

        {/* Header */}
        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
            // gesture demo
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
            Drag & Drop
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>
            three patterns — free drag · axis snap · reorder list
          </p>
        </div>

        {/* Demo tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {DEMOS.map(d => (
            <button key={d.key} onClick={() => setDemo(d.key)} style={{
              flex: 1, background: demo === d.key ? d.color + "22" : C.surface,
              border: `1px solid ${demo === d.key ? d.color : C.border}`,
              borderRadius: 10, padding: "9px 8px",
              color: demo === d.key ? d.color : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <span style={{ fontWeight: demo === d.key ? 700 : 400 }}>{d.label}</span>
              <span style={{ fontSize: 9, opacity: 0.7 }}>{d.desc}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ── Demo area ── */}
          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "18px 16px",
            }}>
              {demo === "free"    && <FreeDragDemo  elastic={elastic}   stiffness={stiffness} damping={damping} />}
              {demo === "axis"    && <AxisDragDemo  stiffness={stiffness} damping={damping} />}
              {demo === "reorder" && <ReorderDemo   stiffness={stiffness} damping={damping} />}
            </div>
            <CodeBlock code={codeStr} />
          </div>

          {/* ── Controls ── */}
          <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>// spring config</div>

              {demo === "free" && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>dragElastic</span>
                    <span style={{ fontSize: 11, color: C.orange, fontWeight: 700 }}>{elastic}</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.05} value={elastic}
                    onChange={e => setElastic(Number(e.target.value))}
                    style={{ width: "100%", accentColor: C.orange }} />
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>
                    0 = hard stop · 1 = free
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>stiffness</span>
                  <span style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>{stiffness}</span>
                </div>
                <input type="range" min={50} max={600} step={10} value={stiffness}
                  onChange={e => setStiffness(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.accent }} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>damping</span>
                  <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>{damping}</span>
                </div>
                <input type="range" min={1} max={60} value={damping}
                  onChange={e => setDamping(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.green }} />
              </div>

              <div style={{ marginTop: 12, fontSize: 10, color: C.muted, lineHeight: 1.8 }}>
                <span style={{ color: C.accent }}>stiffness↑</span> = snappier<br />
                <span style={{ color: C.green }}>damping↓</span>  = bouncier
              </div>
            </div>

            {/* quick presets */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "12px 14px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>// presets</div>
              {[
                { label: "snappy",  s: 400, d: 32 },
                { label: "bouncy",  s: 300, d: 12 },
                { label: "smooth",  s: 180, d: 28 },
                { label: "heavy",   s: 200, d: 50 },
              ].map(p => (
                <button key={p.label} onClick={() => { setStiffness(p.s); setDamping(p.d); }} style={{
                  width: "100%", marginBottom: 5,
                  background: stiffness === p.s && damping === p.d ? C.accent + "18" : "transparent",
                  border: `1px solid ${stiffness === p.s && damping === p.d ? C.accent : C.border}`,
                  borderRadius: 6, padding: "4px 10px",
                  color: stiffness === p.s && damping === p.d ? C.accent : C.muted,
                  fontSize: 10, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", justifyContent: "space-between",
                  transition: "all 0.15s",
                }}>
                  <span>{p.label}</span>
                  <span style={{ opacity: 0.6 }}>{p.s}/{p.d}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
