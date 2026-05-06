import { useState, useRef, useEffect, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

const COLS = 20;
const ROWS = 20;
const CELL = 24;
const CANVAS_W = COLS * CELL;
const CANVAS_H = ROWS * CELL;
const TICK_MS = 120;

const DIR = {
  ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 }, s: { x: 0, y:  1 },
  ArrowLeft:  { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x:  1, y: 0 }, d: { x:  1, y: 0 },
};

function randomFood(snake) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function initState() {
  const snake = [
    { x: 10, y: 10 },
    { x: 9,  y: 10 },
    { x: 8,  y: 10 },
  ];
  return {
    snake,
    food: randomFood(snake),
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    score: 0,
    status: "playing", // playing | over
  };
}

// ── draw ──────────────────────────────────────────────────────────────────────
function drawGame(ctx, state, ratio) {
  ctx.save();
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // background grid
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#0d1117" : "#0f1420";
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }

  const { snake, food } = state;

  // food — pulsing circle
  const now = Date.now();
  const pulse = 0.85 + 0.15 * Math.sin(now / 300);
  const fr = (CELL / 2 - 3) * pulse;
  const fx = food.x * CELL + CELL / 2;
  const fy = food.y * CELL + CELL / 2;

  const foodGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr + 4);
  foodGrad.addColorStop(0, C.orange + "ff");
  foodGrad.addColorStop(1, C.orange + "00");
  ctx.beginPath();
  ctx.arc(fx, fy, fr + 4, 0, Math.PI * 2);
  ctx.fillStyle = foodGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(fx, fy, fr, 0, Math.PI * 2);
  ctx.fillStyle = C.orange;
  ctx.shadowColor = C.orange;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  // snake body
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    const t = 1 - i / snake.length;
    const color = isHead ? C.green : C.green;
    const alpha = Math.round((0.35 + 0.65 * t) * 255).toString(16).padStart(2, "0");
    const pad = isHead ? 1 : 2;
    const r = isHead ? 6 : 4;

    ctx.fillStyle = color + alpha;
    ctx.strokeStyle = C.green + "55";
    ctx.lineWidth = 1;

    // rounded rect
    const rx = seg.x * CELL + pad;
    const ry = seg.y * CELL + pad;
    const rw = CELL - pad * 2;
    const rh = CELL - pad * 2;

    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, r);
    ctx.fill();
    if (isHead) {
      ctx.shadowColor = C.green;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // head eyes
    if (isHead) {
      const { x, y } = state.dir;
      const cx = seg.x * CELL + CELL / 2;
      const cy = seg.y * CELL + CELL / 2;
      const eyeOffset = 4;
      const eyeDist   = 4;

      const eyes = x !== 0
        ? [{ ex: cx + x * 2, ey: cy - eyeOffset }, { ex: cx + x * 2, ey: cy + eyeOffset }]
        : [{ ex: cx - eyeOffset, ey: cy + y * 2 }, { ex: cx + eyeOffset, ey: cy + y * 2 }];

      eyes.forEach(({ ex, ey }) => {
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0d14";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex + x * 0.5, ey + y * 0.5, 1, 0, Math.PI * 2);
        ctx.fillStyle = C.green;
        ctx.fill();
      });
    }
  });

  ctx.restore();
}

function drawOverlay(ctx, state, ratio) {
  if (state.status !== "over") return;
  ctx.save();
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // dim
  ctx.fillStyle = "rgba(10,13,20,0.82)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // panel
  const pw = 260, ph = 140;
  const px = (CANVAS_W - pw) / 2;
  const py = (CANVAS_H - ph) / 2;
  ctx.fillStyle = C.surface;
  ctx.strokeStyle = C.red;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 12);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = C.red;
  ctx.font = "bold 22px monospace";
  ctx.fillText("GAME OVER", CANVAS_W / 2, py + 42);

  ctx.fillStyle = C.text;
  ctx.font = "14px monospace";
  ctx.fillText(`score: ${state.score}`, CANVAS_W / 2, py + 72);

  ctx.fillStyle = C.muted;
  ctx.font = "12px monospace";
  ctx.fillText("натисни Enter або Space", CANVAS_W / 2, py + 100);
  ctx.fillText("щоб спробувати ще раз", CANVAS_W / 2, py + 116);

  ctx.restore();
}

// ── component ─────────────────────────────────────────────────────────────────
export default function SnakeGame() {
  const canvasRef  = useRef(null);
  const stateRef   = useRef(initState());
  const rafRef     = useRef(null);
  const lastTickRef = useRef(0);
  const highRef    = useRef(0);

  const [score, setScore]   = useState(0);
  const [high, setHigh]     = useState(0);
  const [status, setStatus] = useState("playing");
  const [started, setStarted] = useState(false);

  // HiDPI init
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ratio = window.devicePixelRatio || 1;
    cv.width  = CANVAS_W * ratio;
    cv.height = CANVAS_H * ratio;
  }, []);

  const redraw = useCallback(() => {
    const cv  = canvasRef.current;
    if (!cv) return;
    const ratio = window.devicePixelRatio || 1;
    const ctx   = cv.getContext("2d");
    drawGame(ctx, stateRef.current, ratio);
    drawOverlay(ctx, stateRef.current, ratio);
  }, []);

  const restart = useCallback(() => {
    stateRef.current = initState();
    setScore(0);
    setStatus("playing");
    setStarted(true);
    lastTickRef.current = 0;
  }, []);

  // game loop
  useEffect(() => {
    function loop(ts) {
      const state = stateRef.current;

      if (state.status === "playing" && started) {
        if (ts - lastTickRef.current >= TICK_MS) {
          lastTickRef.current = ts;

          // apply direction
          state.dir = state.nextDir;
          const head = {
            x: state.snake[0].x + state.dir.x,
            y: state.snake[0].y + state.dir.y,
          };

          // wall collision
          if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            state.status = "over";
            if (state.score > highRef.current) {
              highRef.current = state.score;
              setHigh(state.score);
            }
            setStatus("over");
          } else if (state.snake.some(s => s.x === head.x && s.y === head.y)) {
            // self collision
            state.status = "over";
            if (state.score > highRef.current) {
              highRef.current = state.score;
              setHigh(state.score);
            }
            setStatus("over");
          } else {
            state.snake.unshift(head);
            if (head.x === state.food.x && head.y === state.food.y) {
              state.score += 1;
              state.food = randomFood(state.snake);
              setScore(state.score);
            } else {
              state.snake.pop();
            }
          }
        }
      }

      redraw();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [redraw, started]);

  // keyboard
  useEffect(() => {
    const handler = (e) => {
      const state = stateRef.current;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!started || state.status === "over") restart();
        return;
      }

      if (!started) { setStarted(true); return; }
      if (state.status === "over") return;

      const newDir = DIR[e.key] || DIR[e.key.toLowerCase()];
      if (!newDir) return;
      e.preventDefault();

      // prevent reversing
      if (newDir.x === -state.dir.x && newDir.y === -state.dir.y) return;
      state.nextDir = newDir;
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [started, restart]);

  // mobile swipe
  const touchRef = useRef(null);
  const handleTouchStart = (e) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

    const state = stateRef.current;
    if (state.status === "over") { restart(); return; }
    if (!started) { setStarted(true); return; }

    let newDir;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      newDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    if (newDir.x === -state.dir.x && newDir.y === -state.dir.y) return;
    state.nextDir = newDir;
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
      boxSizing: "border-box",
    }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
        width: "fit-content",
      }}>
        {/* header */}
        <div style={{
          background: C.surface2, borderBottom: `1px solid ${C.border}`,
          padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16,
        }}>
          <span style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>🐍 Snake</span>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, fontFamily: "monospace" }}>{score}</div>
              <div style={{ fontSize: 10, color: C.muted }}>score</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.yellow, fontFamily: "monospace" }}>{high}</div>
              <div style={{ fontSize: 10, color: C.muted }}>best</div>
            </div>
          </div>
          <div style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 5,
            background: status === "over" ? C.red + "22" : started ? C.green + "22" : C.muted + "22",
            border: `1px solid ${status === "over" ? C.red : started ? C.green : C.muted}55`,
            color: status === "over" ? C.red : started ? C.green : C.muted,
          }}>
            {status === "over" ? "game over" : started ? "playing" : "press any key"}
          </div>
        </div>

        {/* canvas */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: CANVAS_W, height: CANVAS_H }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => { if (!started || status === "over") restart(); }}
          />

          {/* start overlay */}
          {!started && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "rgba(10,13,20,0.75)", gap: 10,
            }}>
              <div style={{ fontSize: 32 }}>🐍</div>
              <div style={{ fontSize: 16, color: C.green, fontWeight: 700 }}>Snake</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>натисни будь-яку клавішу</div>
              <div style={{ fontSize: 11, color: C.muted }}>або клікни щоб почати</div>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "8px 20px", fontSize: 11, color: C.muted,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>⌨️ WASD або ← ↑ → ↓</span>
          <span>📱 swipe на мобільному</span>
          <span style={{ color: C.accent }}>Enter / Space — restart</span>
        </div>
      </div>
    </div>
  );
}
