import { useState, useRef, useEffect } from "react";

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
  red: "#ff5f57",
};

const CANVAS_W = 480;
const CANVAS_H = 300;
const BALL_R = 18;
const SPEED = 220;

// ── token helpers ─────────────────────────────────────────────────────────────
const kw  = (s) => `<span style="color:#bb9af7">${s}</span>`;
const fn  = (s) => `<span style="color:#7dcfff">${s}</span>`;
const str = (s) => `<span style="color:#9ece6a">${s}</span>`;
const num = (s) => `<span style="color:#ff9e64">${s}</span>`;
const cm  = (s) => `<span style="color:#565f89">${s}</span>`;
const tx  = (s) => `<span style="color:#c0caf5">${s}</span>`;
const pu  = (s) => `<span style="color:#c0caf5">${s}</span>`; // punctuation
const id  = (s) => `<span style="color:#c0caf5">${s}</span>`; // identifier

const INTERVAL_CODE = [
  { t: cm("// ❌ поганий спосіб"), h: false },
  { t: `${kw("const")} ${id("intervalId")} ${pu("=")} ${fn("setInterval")}${pu("((")}${pu(")")} ${pu("=>")} ${pu("{")}`, h: true },
  { t: `  ${fn("draw")}${pu("()")}${pu(";")}`, h: true },
  { t: `${pu("}")}${pu(",")} ${num("16")}${pu(");")}`, h: true },
  { t: "", h: false },
  { t: cm("// не синхронізовано з монітором"), h: false },
  { t: cm("// працює у фоновій вкладці"), h: false },
  { t: cm("// накопичує затримки"), h: false },
];

const RAF_CODE = [
  { t: cm("// ✅ правильний спосіб"), h: false },
  { t: `${kw("function")} ${fn("animate")}${pu("(")}${id("timestamp")}${pu(")")} ${pu("{")}`, h: true },
  { t: `  ${fn("draw")}${pu("()")}${pu(";")}`, h: true },
  { t: `  ${fn("requestAnimationFrame")}${pu("(")}${id("animate")}${pu(");")}`, h: true },
  { t: `${pu("}")}`, h: false },
  { t: "", h: false },
  { t: cm("// синхронізовано з монітором"), h: false },
  { t: cm("// пауза у фоні — авто"), h: false },
  { t: cm("// завжди плавно"), h: false },
];

// ── canvas helpers ────────────────────────────────────────────────────────────
function initCanvas(id) {
  const cv = document.getElementById(id);
  if (!cv) return;
  const ratio = window.devicePixelRatio || 1;
  cv.width = CANVAS_W * ratio;
  cv.height = CANVAS_H * ratio;
}

function drawScene(canvasId, ball, color) {
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const ratio = window.devicePixelRatio || 1;
  const ctx = cv.getContext("2d");

  ctx.save();
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // grid
  ctx.strokeStyle = "#1a1b2e";
  ctx.lineWidth = 1;
  for (let x = 0; x <= CANVAS_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }

  const b = ball;
  // trail
  for (let i = 8; i >= 1; i--) {
    ctx.beginPath();
    ctx.arc(
      b.x - b.vx * 0.002 * i,
      b.y - b.vy * 0.002 * i,
      BALL_R * (1 - i * 0.09), 0, Math.PI * 2
    );
    ctx.fillStyle = color + Math.floor((1 - i / 9) * 40).toString(16).padStart(2, "0");
    ctx.fill();
  }

  // ball glow
  const grad = ctx.createRadialGradient(b.x - 5, b.y - 5, 2, b.x, b.y, BALL_R);
  grad.addColorStop(0, color + "ff");
  grad.addColorStop(1, color + "88");
  ctx.beginPath();
  ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function stepBall(ball, dt) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  if (ball.x - BALL_R < 0)        { ball.x = BALL_R;            ball.vx =  Math.abs(ball.vx); }
  if (ball.x + BALL_R > CANVAS_W) { ball.x = CANVAS_W - BALL_R; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - BALL_R < 0)        { ball.y = BALL_R;            ball.vy =  Math.abs(ball.vy); }
  if (ball.y + BALL_R > CANVAS_H) { ball.y = CANVAS_H - BALL_R; ball.vy = -Math.abs(ball.vy); }
}

// ── CodeLine ──────────────────────────────────────────────────────────────────
function CodeLine({ line }) {
  return (
    <div
      style={{
        fontFamily: "inherit",
        fontSize: 12,
        lineHeight: "1.85",
        padding: "0 6px",
        margin: "0 -6px",
        borderRadius: 4,
        background: line.h ? "#2a2c4a" : "transparent",
        whiteSpace: "pre",
        minHeight: "1.85em",
      }}
      dangerouslySetInnerHTML={{ __html: line.t || "&nbsp;" }}
    />
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
function Panel({ label, canvasId, color, fps, paused, onTogglePause, code }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* panel header */}
      <div style={{
        background: C.surface2, borderBottom: `1px solid ${C.border}`,
        padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12, color, fontFamily: "inherit" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 11, fontFamily: "inherit", minWidth: 54, textAlign: "right",
            color: fps >= 55 ? C.green : fps >= 30 ? C.yellow : C.red,
          }}>
            {paused ? "пауза" : `${fps} fps`}
          </span>
          <button onClick={onTogglePause} style={{
            padding: "3px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
            fontFamily: "inherit",
            border: `1px solid ${paused ? color : C.red}`,
            background: paused ? color + "22" : C.red + "22",
            color: paused ? color : C.red,
            transition: "all 0.15s",
          }}>
            {paused ? "▶ старт" : "⏸ пауза"}
          </button>
        </div>
      </div>

      {/* canvas */}
      <div style={{
        background: "#0d1117",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, borderBottom: `1px solid ${C.border}`,
      }}>
        <canvas
          id={canvasId}
          style={{ display: "block", width: CANVAS_W, height: CANVAS_H, maxWidth: "100%", borderRadius: 4 }}
        />
      </div>

      {/* code */}
      <div style={{ padding: "14px 16px", flex: 1 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>// код</div>
        {code.map((line, i) => <CodeLine key={i} line={line} />)}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function RafDemo() {
  const [intervalPaused, setIntervalPaused] = useState(false);
  const [rafPaused, setRafPaused]           = useState(false);
  const [intervalFps, setIntervalFps]       = useState(0);
  const [rafFps, setRafFps]                 = useState(0);

  const intervalBall = useRef({ x: CANVAS_W / 2, y: CANVAS_H / 2, vx: SPEED, vy: SPEED * 0.65 });
  const rafBall      = useRef({ x: CANVAS_W / 2, y: CANVAS_H / 2, vx: SPEED, vy: SPEED * 0.65 });

  const intervalRef     = useRef(null);
  const rafRef          = useRef(null);
  const intervalLast    = useRef(performance.now());
  const rafLast         = useRef(performance.now());
  const intervalFpsBuf  = useRef({ frames: 0, last: performance.now() });
  const rafFpsBuf       = useRef({ frames: 0, last: performance.now() });

  const intervalPausedRef = useRef(false);
  const rafPausedRef      = useRef(false);

  useEffect(() => { intervalPausedRef.current = intervalPaused; }, [intervalPaused]);
  useEffect(() => { rafPausedRef.current = rafPaused; }, [rafPaused]);

  function trackFps(buf, setter) {
    buf.frames++;
    const now = performance.now();
    if (now - buf.last >= 500) {
      setter(Math.round(buf.frames / ((now - buf.last) / 1000)));
      buf.frames = 0;
      buf.last = now;
    }
  }

  // init canvases once
  useEffect(() => {
    initCanvas("cv-interval");
    initCanvas("cv-raf");
  }, []);

  // setInterval loop — always running, respects pause ref
  useEffect(() => {
    intervalLast.current = performance.now();
    intervalFpsBuf.current = { frames: 0, last: performance.now() };

    intervalRef.current = setInterval(() => {
      const now = performance.now();
      const dt = (now - intervalLast.current) / 1000;
      intervalLast.current = now;

      if (!intervalPausedRef.current) {
        stepBall(intervalBall.current, dt);
        drawScene("cv-interval", intervalBall.current, C.orange);
        trackFps(intervalFpsBuf.current, setIntervalFps);
      }
    }, 16);

    return () => clearInterval(intervalRef.current);
  }, []);

  // rAF loop — always running, respects pause ref
  useEffect(() => {
    rafLast.current = performance.now();
    rafFpsBuf.current = { frames: 0, last: performance.now() };

    function animate(ts) {
      const dt = (ts - rafLast.current) / 1000;
      rafLast.current = ts;

      if (!rafPausedRef.current) {
        stepBall(rafBall.current, dt);
        drawScene("cv-raf", rafBall.current, C.accent);
        trackFps(rafFpsBuf.current, setRafFps);
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "28px 20px",
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      userSelect: "none", boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%", maxWidth: 1020,
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
      }}>
        {/* header */}
        <div style={{
          background: C.surface2, borderBottom: `1px solid ${C.border}`,
          padding: "12px 20px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 13, color: C.accent }}>requestAnimationFrame</span>
          <span style={{ fontSize: 12, color: C.muted }}>vs</span>
          <span style={{ fontSize: 13, color: C.orange }}>setInterval</span>
          <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
            перемкни на іншу вкладку і поглянь на fps
          </span>
        </div>

        {/* two panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ borderRight: `1px solid ${C.border}` }}>
            <Panel
              label="setInterval"
              canvasId="cv-interval"
              color={C.orange}
              fps={intervalFps}
              paused={intervalPaused}
              onTogglePause={() => setIntervalPaused(p => !p)}
              code={INTERVAL_CODE}
            />
          </div>
          <Panel
            label="requestAnimationFrame"
            canvasId="cv-raf"
            color={C.accent}
            fps={rafFps}
            paused={rafPaused}
            onTogglePause={() => setRafPaused(p => !p)}
            code={RAF_CODE}
          />
        </div>

        {/* footer */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "10px 20px", fontSize: 11, color: C.muted,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <span>
            <span style={{ color: C.orange }}>setInterval</span>
            {" "}— фіксований інтервал, не прив'язаний до монітора
          </span>
          <span style={{ color: C.border }}>|</span>
          <span>
            <span style={{ color: C.accent }}>rAF</span>
            {" "}— синхронізовано з кожним кадром браузера
          </span>
        </div>
      </div>
    </div>
  );
}
