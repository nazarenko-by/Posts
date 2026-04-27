import { useState, useRef, useEffect, useCallback } from "react";

const C = {
  bg: "#0a0d14",
  surface: "#1a1b2e",
  surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff",
  purple: "#bb9af7",
  green: "#9ece6a",
  orange: "#ff9e64",
  yellow: "#e0af68",
  muted: "#565f89",
  text: "#c0caf5",
};

const CANVAS_W = 480;
const CANVAS_H = 360;

const SHAPES = [
  {
    id: "rect",
    label: "rect",
    color: "#7dcfff",
    default: { x: 80, y: 70, w: 240, h: 150 },
    getCode: (p) => [
      { t: `ctx.fillStyle = '#7dcfff22';`, h: true },
      { t: `ctx.strokeStyle = '#7dcfff';`, h: true },
      { t: `ctx.lineWidth = 2;`, h: false },
      { t: ``, h: false },
      { t: `ctx.beginPath();`, h: false },
      { t: `ctx.rect(`, h: true },
      { t: `  ${p.x}, ${p.y},`, h: true },
      { t: `  ${p.w}, ${p.h}`, h: true },
      { t: `);`, h: false },
      { t: `ctx.fill();`, h: false },
      { t: `ctx.stroke();`, h: false },
    ],
    draw(ctx, p, hover) {
      ctx.fillStyle = p.color + "22";
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.w, p.h);
      ctx.fill();
      ctx.stroke();
      if (hover) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = p.color + "55";
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - 8, p.y - 8, p.w + 16, p.h + 16);
        ctx.restore();
      }
      return [
        { x: p.x, y: p.y, label: `(${p.x}, ${p.y})`, below: true },
        { x: p.x + p.w, y: p.y + p.h, label: `w:${p.w} h:${p.h}`, below: true },
      ];
    },
    hitTest: (mx, my, p) =>
      mx >= p.x && mx <= p.x + p.w && my >= p.y && my <= p.y + p.h,
  },
  {
    id: "circle",
    label: "circle",
    color: "#bb9af7",
    default: { x: 240, y: 180, r: 110 },
    getCode: (p) => [
      { t: `ctx.fillStyle = '#bb9af722';`, h: true },
      { t: `ctx.strokeStyle = '#bb9af7';`, h: true },
      { t: `ctx.lineWidth = 2;`, h: false },
      { t: ``, h: false },
      { t: `ctx.beginPath();`, h: false },
      { t: `ctx.arc(`, h: true },
      { t: `  ${p.x}, ${p.y}, ${p.r},`, h: true },
      { t: `  0, Math.PI * 2`, h: false },
      { t: `);`, h: false },
      { t: `ctx.fill();`, h: false },
      { t: `ctx.stroke();`, h: false },
    ],
    draw(ctx, p, hover) {
      ctx.fillStyle = p.color + "22";
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (hover) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = p.color + "55";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      return [
        { x: p.x, y: p.y, label: `cx:${p.x} cy:${p.y}`, below: true },
        { x: p.x + p.r, y: p.y, label: `r:${p.r}`, below: true },
      ];
    },
    hitTest: (mx, my, p) => Math.hypot(mx - p.x, my - p.y) <= p.r,
  },
  {
    id: "line",
    label: "line",
    color: "#9ece6a",
    default: { x: 60, y: 300, x2: 420, y2: 60 },
    getCode: (p) => [
      { t: `ctx.strokeStyle = '#9ece6a';`, h: true },
      { t: `ctx.lineWidth = 3;`, h: false },
      { t: ``, h: false },
      { t: `ctx.beginPath();`, h: false },
      { t: `ctx.moveTo(${p.x}, ${p.y});`, h: true },
      { t: `ctx.lineTo(${p.x2}, ${p.y2});`, h: true },
      { t: `ctx.stroke();`, h: false },
    ],
    draw(ctx, p, hover) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();
      [{ x: p.x, y: p.y }, { x: p.x2, y: p.y2 }].forEach((pt) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, hover ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
      });
      return [
        { x: p.x, y: p.y, label: `(${p.x}, ${p.y})`, below: true },
        { x: p.x2, y: p.y2, label: `(${p.x2}, ${p.y2})`, below: true },
      ];
    },
    hitTest: (mx, my, p) => {
      const dx = p.x2 - p.x, dy = p.y2 - p.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) return false;
      const t = Math.max(0, Math.min(1, ((mx - p.x) * dx + (my - p.y) * dy) / (len * len)));
      return Math.hypot(mx - (p.x + t * dx), my - (p.y + t * dy)) < 14;
    },
  },
  {
    id: "text",
    label: "text",
    color: "#e0af68",
    default: { x: 60, y: 160 },
    getCode: (p) => [
      { t: `ctx.fillStyle = '#e0af68';`, h: true },
      { t: `ctx.font = 'bold 48px monospace';`, h: true },
      { t: ``, h: false },
      { t: `ctx.fillText(`, h: true },
      { t: `  'Canvas',`, h: true },
      { t: `  ${p.x}, ${p.y}`, h: true },
      { t: `);`, h: false },
      { t: `// y — це baseline тексту`, h: false },
    ],
    draw(ctx, p, hover) {
      ctx.fillStyle = p.color;
      ctx.font = "bold 48px monospace";
      ctx.fillText("Canvas", p.x, p.y);
      if (hover) {
        ctx.save();
        ctx.strokeStyle = p.color + "55";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 260, p.y);
        ctx.stroke();
        ctx.restore();
      }
      return [{ x: p.x, y: p.y, label: `(${p.x}, ${p.y}) — baseline`, below: true }];
    },
    hitTest: (mx, my, p) =>
      mx >= p.x && mx <= p.x + 260 && my >= p.y - 48 && my <= p.y + 8,
  },
];

function CodeLine({ line }) {
  const html = line.t
    .replace(/\b(ctx)\b/g, `<span style="color:${C.text}">$1</span>`)
    .replace(/\.(fillStyle|strokeStyle|lineWidth|beginPath|rect|fill|stroke|arc|moveTo|lineTo|fillText|font|setLineDash)\b/g,
      (m) => `<span style="color:${C.accent}">${m}</span>`)
    .replace(/'([^']*)'/g, `<span style="color:${C.green}">'$1'</span>`)
    .replace(/\b(\d+)\b/g, `<span style="color:${C.orange}">$1</span>`)
    .replace(/(\/\/.+)$/, `<span style="color:${C.muted}">$1</span>`)
    .replace(/\b(Math)\b/g, `<span style="color:${C.text}">$1</span>`);

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono','Fira Code',monospace",
        fontSize: 13,
        lineHeight: "1.9",
        padding: "0 8px",
        margin: "0 -8px",
        borderRadius: 4,
        background: line.h ? "#2a2c4a" : "transparent",
        color: C.text,
        whiteSpace: "pre",
        transition: "background 0.2s",
        minHeight: "1.9em",
      }}
      dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }}
    />
  );
}

export default function CanvasDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [params, setParams] = useState(() =>
    SHAPES.map((s) => ({ ...s.default, color: s.color }))
  );
  const [dragging, setDragging] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [cursor, setCursor] = useState({ x: null, y: null });

  const canvasRef = useRef(null);
  const dragStart = useRef(null);
  const initialized = useRef(false);

  const shape = SHAPES[activeIdx];
  const p = params[activeIdx];

  // HiDPI setup — run once
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || initialized.current) return;
    initialized.current = true;
    const ratio = window.devicePixelRatio || 1;
    cv.width = CANVAS_W * ratio;
    cv.height = CANVAS_H * ratio;
    const ctx = cv.getContext("2d");
    ctx.scale(ratio, ratio);
  }, []);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ratio = window.devicePixelRatio || 1;
    const ctx = cv.getContext("2d");

    ctx.save();
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const dots = shape.draw(ctx, p, hovered || dragging !== null);

    dots.forEach((d) => {
      ctx.fillStyle = shape.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = shape.color + "dd";
      ctx.font = "11px monospace";
      // always render label below the anchor point
      ctx.fillText(d.label, d.x + 7, d.y + 16);
    });

    ctx.restore();
  }, [shape, p, hovered, dragging]);

  useEffect(() => { draw(); }, [draw]);

  const getCanvasPos = (e) => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - r.left) * (CANVAS_W / r.width)),
      y: Math.round((e.clientY - r.top) * (CANVAS_H / r.height)),
    };
  };

  const handleMouseDown = (e) => {
    const pos = getCanvasPos(e);
    if (shape.hitTest(pos.x, pos.y, p)) {
      setDragging(pos);
      dragStart.current = { ...p };
    }
  };

  const handleMouseMove = (e) => {
    const pos = getCanvasPos(e);
    setCursor(pos);
    if (dragging) {
      const dx = pos.x - dragging.x;
      const dy = pos.y - dragging.y;
      const base = dragStart.current;
      const next = { ...p };
      if ("x2" in p) {
        next.x = Math.max(0, Math.min(CANVAS_W, base.x + dx));
        next.y = Math.max(0, Math.min(CANVAS_H, base.y + dy));
        next.x2 = Math.max(0, Math.min(CANVAS_W, base.x2 + dx));
        next.y2 = Math.max(0, Math.min(CANVAS_H, base.y2 + dy));
      } else {
        next.x = Math.max(0, Math.min(CANVAS_W - (p.w || 0), base.x + dx));
        next.y = Math.max(0, Math.min(CANVAS_H - (p.h || 0), base.y + dy));
      }
      setParams((prev) =>
        prev.map((pp, i) => (i === activeIdx ? { ...pp, ...next } : pp))
      );
    } else {
      setHovered(shape.hitTest(pos.x, pos.y, p));
    }
  };

  const handleMouseUp = () => { setDragging(null); dragStart.current = null; };
  const handleMouseLeave = () => {
    setCursor({ x: null, y: null });
    setHovered(false);
    setDragging(null);
    dragStart.current = null;
  };

  const cursorStyle = dragging ? "grabbing" : hovered ? "grab" : "crosshair";

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      userSelect: "none",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 980,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: "hidden",
      }}>
        {/* header */}
        <div style={{
          background: C.surface2,
          borderBottom: `1px solid ${C.border}`,
          padding: "11px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 11, color: C.muted }}>// фігура:</span>
          {SHAPES.map((s, i) => (
            <button key={s.id}
              onClick={() => { setActiveIdx(i); setDragging(null); setHovered(false); }}
              style={{
                padding: "4px 15px",
                borderRadius: 6,
                border: `1px solid ${i === activeIdx ? s.color : C.border}`,
                background: i === activeIdx ? s.color + "22" : "transparent",
                color: i === activeIdx ? s.color : C.muted,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
              {s.label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>
            {cursor.x !== null
              ? <span style={{ color: shape.color }}>x:{cursor.x} y:{cursor.y}</span>
              : <span>наведи на canvas</span>
            }
          </div>
        </div>

        {/* body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* canvas */}
          <div style={{
            background: "#0d1117",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 28,
            borderRight: `1px solid ${C.border}`,
          }}>
            <canvas
              ref={canvasRef}
              style={{
                display: "block",
                width: CANVAS_W,
                height: CANVAS_H,
                maxWidth: "100%",
                cursor: cursorStyle,
                borderRadius: 4,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />
          </div>

          {/* code */}
          <div style={{ padding: "22px 20px" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// код</div>
            {shape.getCode(p).map((line, i) => (
              <CodeLine key={i} line={line} />
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "9px 20px",
          fontSize: 11,
          color: C.muted,
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}>
          <span style={{
            display: "inline-block", width: 6, height: 6, borderRadius: "50%",
            background: dragging ? shape.color : hovered ? shape.color + "88" : C.border,
            transition: "background 0.2s",
            flexShrink: 0,
          }} />
          {dragging
            ? <span style={{ color: shape.color }}>перетягуєш — координати оновлюються в реальному часі</span>
            : hovered
              ? <span style={{ color: shape.color }}>натисни і перетягни</span>
              : <span>наведи курсор на фігуру щоб перетягнути</span>
          }
        </div>
      </div>
    </div>
  );
}
