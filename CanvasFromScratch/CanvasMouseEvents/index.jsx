import { useState, useRef, useEffect, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57", teal: "#1abc9c",
};

const CANVAS_W = 620;
const CANVAS_H = 380;

const COLORS = [C.accent, C.purple, C.green, C.orange, C.yellow, C.teal, C.red];

const INITIAL_SHAPES = [
  { id: 1, type: "circle", x: 120, y: 120, r: 50,     colorIdx: 0, label: "circle" },
  { id: 2, type: "rect",   x: 280, y: 80,  w: 130, h: 90, colorIdx: 1, label: "rect" },
  { id: 3, type: "circle", x: 480, y: 150, r: 60,     colorIdx: 2, label: "circle" },
  { id: 4, type: "rect",   x: 160, y: 240, w: 110, h: 80, colorIdx: 3, label: "rect" },
  { id: 5, type: "circle", x: 380, y: 270, r: 45,     colorIdx: 4, label: "circle" },
];

function hitTest(shape, mx, my) {
  if (shape.type === "circle") {
    return Math.hypot(mx - shape.x, my - shape.y) <= shape.r;
  }
  return mx >= shape.x && mx <= shape.x + shape.w &&
         my >= shape.y && my <= shape.y + shape.h;
}

function drawShape(ctx, shape, hovered, selected) {
  const color = COLORS[shape.colorIdx % COLORS.length];
  const isHovered  = hovered  === shape.id;
  const isSelected = selected === shape.id;

  ctx.save();

  // glow for selected
  if (isSelected) {
    ctx.shadowColor = color;
    ctx.shadowBlur  = 20;
  }

  // fill
  ctx.fillStyle = color + (isHovered ? "55" : "33");
  ctx.strokeStyle = color;
  ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1.5;

  if (shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    const rad = 8;
    ctx.beginPath();
    ctx.roundRect(shape.x, shape.y, shape.w, shape.h, rad);
    ctx.fill();
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // hover dashed outline
  if (isHovered && !isSelected) {
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = color + "88";
    ctx.lineWidth = 1;
    if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.r + 9, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(shape.x - 8, shape.y - 8, shape.w + 16, shape.h + 16);
    }
    ctx.setLineDash([]);
  }

  // label
  ctx.fillStyle = color;
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  const lx = shape.type === "circle" ? shape.x : shape.x + shape.w / 2;
  const ly = shape.type === "circle" ? shape.y + 4 : shape.y + shape.h / 2 + 4;
  ctx.fillText(shape.label, lx, ly);

  // coord label on hover
  if (isHovered || isSelected) {
    const cx = shape.type === "circle" ? shape.x : shape.x + shape.w / 2;
    const cy = shape.type === "circle" ? shape.y - shape.r - 12 : shape.y - 12;
    ctx.fillStyle = color + "cc";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    const px = shape.type === "circle" ? Math.round(shape.x) : Math.round(shape.x);
    const py = shape.type === "circle" ? Math.round(shape.y) : Math.round(shape.y);
    ctx.fillText(`(${px}, ${py})`, cx, cy);
  }

  ctx.restore();
}

// ── event log ─────────────────────────────────────────────────────────────────
const EVENT_COLORS = {
  mousemove:  C.accent,
  mousedown:  C.orange,
  mouseup:    C.green,
  click:      C.purple,
  mouseleave: C.muted,
};

export default function MouseEventsDemo() {
  const canvasRef  = useRef(null);
  const shapesRef  = useRef(INITIAL_SHAPES.map(s => ({ ...s })));
  const [, forceUpdate] = useState(0);

  const hoveredRef  = useRef(null);
  const selectedRef = useRef(null);
  const draggingRef = useRef(null);   // { id, offX, offY }
  const mouseRef    = useRef({ x: 0, y: 0 });
  const lastClickRef = useRef(null);  // for double-click color change

  const [eventLog, setEventLog] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [activeEvent, setActiveEvent] = useState(null);

  const addLog = useCallback((name, detail = "") => {
    setActiveEvent(name);
    setEventLog(prev => [
      { name, detail, id: Date.now() + Math.random() },
      ...prev.slice(0, 5),
    ]);
  }, []);

  // HiDPI init
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ratio = window.devicePixelRatio || 1;
    cv.width  = CANVAS_W * ratio;
    cv.height = CANVAS_H * ratio;
  }, []);

  // draw
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ratio = window.devicePixelRatio || 1;
    const ctx   = cv.getContext("2d");

    ctx.save();
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // grid
    ctx.strokeStyle = "#1a1b2e";
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke(); }
    for (let y = 0; y <= CANVAS_H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke(); }

    // draw shapes (selected last = on top)
    const shapes  = shapesRef.current;
    const selId   = selectedRef.current;
    const ordered = [...shapes.filter(s => s.id !== selId), ...shapes.filter(s => s.id === selId)];
    ordered.forEach(s => drawShape(ctx, s, hoveredRef.current, selectedRef.current));

    // crosshair at mouse
    const { x, y } = mouseRef.current;
    ctx.strokeStyle = C.muted + "44";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }, []);

  const getPos = (e) => {
    const cv = canvasRef.current;
    const r  = cv.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (CANVAS_W / r.width),
      y: (e.clientY - r.top)  * (CANVAS_H / r.height),
    };
  };

  const getTopShape = (x, y) => {
    const shapes = shapesRef.current;
    const selId  = selectedRef.current;
    // check selected first, then reverse order (top = last drawn)
    const ordered = [...shapes.filter(s => s.id !== selId), ...shapes.filter(s => s.id === selId)].reverse();
    return ordered.find(s => hitTest(s, x, y)) || null;
  };

  const handleMouseMove = useCallback((e) => {
    const { x, y } = getPos(e);
    mouseRef.current = { x, y };
    setCursorPos({ x: Math.round(x), y: Math.round(y) });

    if (draggingRef.current) {
      const { id, offX, offY } = draggingRef.current;
      shapesRef.current = shapesRef.current.map(s => {
        if (s.id !== id) return s;
        if (s.type === "circle") {
          return { ...s, x: Math.round(x - offX), y: Math.round(y - offY) };
        }
        return { ...s, x: Math.round(x - offX), y: Math.round(y - offY) };
      });
      addLog("mousemove", `drag id:${id} → (${Math.round(x)}, ${Math.round(y)})`);
    } else {
      const hit = getTopShape(x, y);
      hoveredRef.current = hit ? hit.id : null;
      if (hit) addLog("mousemove", `hover: ${hit.label} id:${hit.id}`);
    }

    draw();
  }, [draw, addLog]);

  const handleMouseDown = useCallback((e) => {
    const { x, y } = getPos(e);
    const hit = getTopShape(x, y);

    if (hit) {
      const offX = hit.type === "circle" ? x - hit.x : x - hit.x;
      const offY = hit.type === "circle" ? y - hit.y : y - hit.y;
      draggingRef.current = { id: hit.id, offX, offY };

      // bring to front by reordering
      shapesRef.current = [
        ...shapesRef.current.filter(s => s.id !== hit.id),
        shapesRef.current.find(s => s.id === hit.id),
      ];

      selectedRef.current = hit.id;
      addLog("mousedown", `select id:${hit.id} at (${Math.round(x)}, ${Math.round(y)})`);
    } else {
      selectedRef.current = null;
      addLog("mousedown", `miss at (${Math.round(x)}, ${Math.round(y)})`);
    }

    draw();
  }, [draw, addLog]);

  const handleMouseUp = useCallback((e) => {
    const { x, y } = getPos(e);
    if (draggingRef.current) {
      addLog("mouseup", `drop id:${draggingRef.current.id} at (${Math.round(x)}, ${Math.round(y)})`);
      draggingRef.current = null;
    } else {
      addLog("mouseup", `(${Math.round(x)}, ${Math.round(y)})`);
    }
    draw();
  }, [draw, addLog]);

  const handleClick = useCallback((e) => {
    const { x, y } = getPos(e);
    const hit = getTopShape(x, y);
    if (!hit) return;

    const now = Date.now();
    // double click = same shape clicked within 400ms
    if (lastClickRef.current?.id === hit.id && now - lastClickRef.current.ts < 400) {
      // change color
      shapesRef.current = shapesRef.current.map(s =>
        s.id === hit.id ? { ...s, colorIdx: (s.colorIdx + 1) % COLORS.length } : s
      );
      addLog("click", `🎨 color change id:${hit.id}`);
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { id: hit.id, ts: now };
      addLog("click", `id:${hit.id} → двічі щоб змінити колір`);
    }

    draw();
  }, [draw, addLog]);

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current  = null;
    draggingRef.current = null;
    addLog("mouseleave", "cursor left canvas");
    draw();
  }, [draw, addLog]);

  const isDragging = !!draggingRef.current;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
      userSelect: "none", boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%", maxWidth: 700,
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
      }}>
        {/* header */}
        <div style={{
          background: C.surface2, borderBottom: `1px solid ${C.border}`,
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 12, color: C.text }}>Canvas mouse events</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            {activeEvent && (
              <span style={{
                fontSize: 11, padding: "2px 10px", borderRadius: 5,
                background: (EVENT_COLORS[activeEvent] || C.muted) + "22",
                border: `1px solid ${EVENT_COLORS[activeEvent] || C.muted}55`,
                color: EVENT_COLORS[activeEvent] || C.muted,
                transition: "color 0.15s",
              }}>{activeEvent}</span>
            )}
            <span style={{ fontSize: 11, color: C.muted }}>
              x:{cursorPos.x} y:{cursorPos.y}
            </span>
          </div>
        </div>

        {/* canvas */}
        <div style={{ background: "#0d1117" }}>
          <canvas
            ref={canvasRef}
            style={{
              display: "block", width: CANVAS_W, height: CANVAS_H, maxWidth: "100%",
              cursor: isDragging ? "grabbing" : hoveredRef.current ? "grab" : "crosshair",
            }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={handleClick}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        {/* event log */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 16px" }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>// event log</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, minHeight: 96 }}>
            {eventLog.length === 0 && (
              <div style={{ fontSize: 11, color: C.muted }}>наведи або клікни на фігуру...</div>
            )}
            {eventLog.map((ev, i) => (
              <div key={ev.id} style={{
                display: "flex", gap: 8, alignItems: "center",
                opacity: 1 - i * 0.15,
                transition: "opacity 0.2s",
              }}>
                <span style={{
                  fontSize: 11, minWidth: 90,
                  color: EVENT_COLORS[ev.name] || C.muted,
                  fontFamily: "monospace",
                }}>{ev.name}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{ev.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "8px 16px", fontSize: 10, color: C.muted,
          display: "flex", gap: 16, flexWrap: "wrap",
        }}>
          <span><span style={{ color: C.accent }}>hover</span> — наведи на фігуру</span>
          <span><span style={{ color: C.orange }}>drag</span> — перетягни</span>
          <span><span style={{ color: C.purple }}>2× click</span> — зміни колір</span>
        </div>
      </div>
    </div>
  );
}
