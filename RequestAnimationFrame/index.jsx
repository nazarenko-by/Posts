import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

const TABS = ["// порівняння", "// delta time", "// пауза"];

const card = {
  background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 14, overflow: "hidden", marginBottom: 16,
};
const cardHeader = {
  background: C.surface2, padding: "11px 20px",
  borderBottom: `1px solid ${C.border}`,
  display: "flex", alignItems: "center", justifyContent: "space-between",
};
const codeBlock = {
  background: C.surface2, borderRadius: 8,
  padding: "14px 18px", fontSize: 12, lineHeight: 1.85,
  color: C.text, borderLeft: `2px solid ${C.purple}`,
  fontFamily: "'JetBrains Mono','Fira Code',monospace",
  whiteSpace: "pre", overflowX: "auto",
};

const btn = (active, color = C.accent) => ({
  background: active ? color + "22" : "transparent",
  border: `1px solid ${active ? color : C.border}`,
  borderRadius: 8, padding: "7px 16px", fontSize: 12,
  fontFamily: "'JetBrains Mono','Fira Code',monospace",
  color: active ? color : C.muted, cursor: "pointer",
  transition: "all .15s",
});

function Code({ children }) { return <pre style={codeBlock}>{children}</pre>; }
function Kw({ c }) { return <span style={{ color: C.purple }}>{c}</span>; }
function Pr({ c }) { return <span style={{ color: C.accent }}>{c}</span>; }
function St({ c }) { return <span style={{ color: C.green }}>{c}</span>; }
function Nm({ c }) { return <span style={{ color: C.orange }}>{c}</span>; }
function Cm({ c }) { return <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>; }

// ─── canvas drawing helpers ───────────────────────────────────────────────────

function clearCanvas(ctx, W, H) {
  ctx.fillStyle = C.surface2;
  ctx.fillRect(0, 0, W, H);
}

// Grid dots background
function drawGrid(ctx, W, H) {
  ctx.fillStyle = C.border;
  for (let x = 20; x < W; x += 24) {
    for (let y = 20; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Floor line
function drawFloor(ctx, W, H) {
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(12, H - 12);
  ctx.lineTo(W - 12, H - 12);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Ball with glow ring and shadow — no text inside
function drawBall(ctx, x, y, r, color, squash = 1) {
  const scaleX = 1 + (1 - squash) * 0.5;
  const scaleY = squash;

  // shadow on floor
  const shadowAlpha = Math.max(0, 0.25 - (y / 400) * 0.1);
  ctx.save();
  ctx.scale(1, 0.3);
  ctx.beginPath();
  ctx.ellipse(x, (400 / 0.3), r * scaleX * 1.1, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);

  // outer glow
  ctx.beginPath();
  ctx.ellipse(0, 0, r * scaleX + 6, r * scaleY + 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = color + "18";
  ctx.fill();

  // ball fill
  ctx.beginPath();
  ctx.ellipse(0, 0, r * scaleX, r * scaleY, 0, 0, Math.PI * 2);
  ctx.fillStyle = color + "30";
  ctx.fill();

  // ball stroke
  ctx.beginPath();
  ctx.ellipse(0, 0, r * scaleX, r * scaleY, 0, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // shine
  ctx.beginPath();
  ctx.ellipse(-r * scaleX * 0.28, -r * scaleY * 0.28, r * 0.18, r * 0.12, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fill();

  ctx.restore();
}

// Label above or below — never inside ball
function drawLabel(ctx, x, y, label, color, above = true) {
  ctx.font = "bold 11px 'JetBrains Mono',monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.fillText(label, x, above ? y - 30 : y + 30);
}

// ── Tab 1: порівняння rAF vs setTimeout ──────────────────────────────────────
function CompareTab() {
  const rafRef  = useRef(null);
  const stRef   = useRef(null);
  const cvsRaf  = useRef(null);
  const cvsSt   = useRef(null);
  const stateR  = useRef({ x: 60, y: 80, vy: 0, bounces: 0, last: 0 });
  const stateST = useRef({ x: 60, y: 80, vy: 0, bounces: 0 });
  const runRef  = useRef({ raf: false, st: false });
  const [running, setRunning] = useState({ raf: false, st: false });
  const [jitter, setJitter] = useState(0);
  const jitterRef = useRef(0);

  const W = 420, H = 160, R = 16, FLOOR = H - 28, GRAVITY = 900, BOUNCE = 0.72, SPEED_X = 90;

  function drawScene(cvs, s, color, label, frameLabel) {
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    clearCanvas(ctx, W, H);
    drawGrid(ctx, W, H);
    drawFloor(ctx, W, H);

    // squash on bounce
    const proximity = Math.max(0, 1 - (FLOOR - s.y) / (FLOOR * 0.25));
    const squash = 1 - proximity * 0.28;

    drawBall(ctx, s.x, s.y, R, color, squash);
    drawLabel(ctx, s.x, s.y, label, color, s.y > H / 2);

    // bounce counter
    ctx.font = "10px 'JetBrains Mono',monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = C.muted;
    ctx.fillText(`bounces: ${s.bounces}`, 12, 18);
    ctx.textAlign = "right";
    ctx.fillStyle = color;
    ctx.fillText(frameLabel, W - 12, 18);
  }

  // rAF physics
  const rafLoop = useCallback((ts) => {
    if (!runRef.current.raf) return;
    const s = stateR.current;
    const delta = s.last ? Math.min(ts - s.last, 50) : 16;
    s.last = ts;
    const dt = delta / 1000;

    s.vy += GRAVITY * dt;
    s.y  += s.vy * dt;
    s.x  += SPEED_X * dt;

    if (s.x > W - R) s.x = W - R;
    if (s.x > W - R || s.x < R) s.x = Math.max(R, Math.min(W - R, s.x));

    if (s.y >= FLOOR - R) {
      s.y = FLOOR - R;
      s.vy *= -BOUNCE;
      if (Math.abs(s.vy) < 40) s.vy = -GRAVITY * 0.4;
      s.bounces++;
    }
    if (s.x >= W - R) { s.x = R; }

    drawScene(cvsRaf.current, s, C.accent, "rAF", "~16ms/frame");
    rafRef.current = requestAnimationFrame(rafLoop);
  }, []);

  // setTimeout physics (with jitter)
  const stLoop = useCallback(() => {
    if (!runRef.current.st) return;
    const s = stateST.current;
    const dt = 16 / 1000;

    s.vy += GRAVITY * dt;
    s.y  += s.vy * dt;
    s.x  += SPEED_X * dt;

    if (s.y >= FLOOR - R) {
      s.y = FLOOR - R;
      s.vy *= -BOUNCE;
      if (Math.abs(s.vy) < 40) s.vy = -GRAVITY * 0.4;
      s.bounces++;
    }
    if (s.x >= W - R) { s.x = R; }

    const j = Math.round(Math.random() * 12);
    jitterRef.current = j;
    setJitter(j);
    drawScene(cvsSt.current, s, C.orange, "setTimeout", `~${16 + j}ms/frame`);
    stRef.current = setTimeout(stLoop, 16 + j);
  }, []);

  function toggleRaf() {
    const next = !runRef.current.raf;
    runRef.current.raf = next;
    setRunning(p => ({ ...p, raf: next }));
    if (next) { stateR.current.last = 0; rafRef.current = requestAnimationFrame(rafLoop); }
    else cancelAnimationFrame(rafRef.current);
  }
  function toggleSt() {
    const next = !runRef.current.st;
    runRef.current.st = next;
    setRunning(p => ({ ...p, st: next }));
    if (next) stLoop();
    else clearTimeout(stRef.current);
  }

  useEffect(() => {
    drawScene(cvsRaf.current, stateR.current, C.accent, "rAF", "~16ms/frame");
    drawScene(cvsSt.current, stateST.current, C.orange, "setTimeout", "~16ms/frame");
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(stRef.current);
      runRef.current = { raf: false, st: false };
    };
  }, []);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* rAF card */}
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={cardHeader}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>requestAnimationFrame</span>
            <span style={{ fontSize: 11, color: running.raf ? C.green : C.muted }}>
              {running.raf ? "● running" : "○ stopped"}
            </span>
          </div>
          <div style={{ padding: 14 }}>
            <canvas ref={cvsRaf} width={W} height={H}
              style={{ width: "100%", borderRadius: 8, display: "block", marginBottom: 10 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button style={btn(running.raf, C.accent)} onClick={toggleRaf}>
                {running.raf ? "⏹ stop" : "▶ start"}
              </button>
              <span style={{ fontSize: 11, color: C.green }}>синхронізовано з монітором ✓</span>
            </div>
          </div>
        </div>
        {/* setTimeout card */}
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={cardHeader}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.orange }}>setTimeout(fn, 16)</span>
            <span style={{ fontSize: 11, color: running.st ? C.green : C.muted }}>
              {running.st ? "● running" : "○ stopped"}
            </span>
          </div>
          <div style={{ padding: 14 }}>
            <canvas ref={cvsSt} width={W} height={H}
              style={{ width: "100%", borderRadius: 8, display: "block", marginBottom: 10 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button style={btn(running.st, C.orange)} onClick={toggleSt}>
                {running.st ? "⏹ stop" : "▶ start"}
              </button>
              <span style={{ fontSize: 11, color: C.orange }}>
                jitter: +{jitter}ms {jitter > 6 ? "⚠️" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Code>
<Cm c="// ❌ setTimeout — не знає про монітор, є jitter" />{"\n"}
<Kw c="function" /> <Pr c="badLoop" />{"() {\n"}
{"  "}<Pr c="update" />{"();\n"}
{"  "}<Pr c="draw" />{"();\n"}
{"  "}<Pr c="setTimeout" />{"(badLoop, "}<Nm c="16" />{"); "}<Cm c="// може прийти через 17-28ms" />{"\n"}
{"}\n\n"}
<Cm c="// ✅ rAF — синхронізований з vSync дисплею" />{"\n"}
<Kw c="function" /> <Pr c="loop" />{"(timestamp) {\n"}
{"  "}<Pr c="update" />{"(timestamp);\n"}
{"  "}<Pr c="draw" />{"();\n"}
{"  "}<Pr c="requestAnimationFrame" />{"(loop); "}<Cm c="// точно перед наступним кадром" />{"\n"}
{"}\n"}
<Pr c="requestAnimationFrame" />{"(loop);"}
      </Code>
      <div style={{ background: C.surface2, border: `1px solid ${C.yellow}44`, borderRadius: 10, padding: "12px 16px", marginTop: 12, fontSize: 12, lineHeight: 1.8 }}>
        <span style={{ color: C.yellow, fontWeight: 700 }}>💡</span>
        {" Запусти обидва і дивись — setTimeout робить мікро-стрибки через random jitter (+0..12ms). rAF завжди рівний."}
      </div>
    </div>
  );
}

// ── Tab 2: delta time — bouncing balls at different "fps" ─────────────────────
function DeltaTab() {
  const cvs30  = useRef(null);
  const cvs60  = useRef(null);
  const cvsDt  = useRef(null);
  const rafIds = useRef({});
  const s30    = useRef({ x: 50, y: 60, vy: 0, frame: 0 });
  const s60    = useRef({ x: 50, y: 60, vy: 0 });
  const sDt    = useRef({ x: 50, y: 60, vy: 0, last: 0 });

  const W = 600, H = 120, R = 14, FLOOR = H - 22;
  const GRAVITY = 700, BOUNCE = 0.70, SPEED_X = 80;

  function drawRow(cvs, s, color, label, note) {
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    clearCanvas(ctx, W, H);
    drawFloor(ctx, W, H);

    // trail dots
    // squash
    const proximity = Math.max(0, 1 - (FLOOR - s.y) / (FLOOR * 0.35));
    const squash = 1 - proximity * 0.3;
    drawBall(ctx, s.x, s.y, R, color, squash);

    // label outside ball — left side
    ctx.font = "bold 10px 'JetBrains Mono',monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = color;
    ctx.fillText(label, 10, 16);
    ctx.fillStyle = C.muted;
    ctx.textAlign = "right";
    ctx.fillText(note, W - 10, 16);
  }

  useEffect(() => {
    drawRow(cvs30.current, s30.current, C.purple, "30fps (без delta)", "x += SPEED / 30");
    drawRow(cvs60.current, s60.current, C.accent, "60fps (без delta)", "x += SPEED / 60");
    drawRow(cvsDt.current, sDt.current, C.green,  "delta time ✓",     "x += SPEED * (dt/1000)");

    let frame = 0;

    // 30fps: skip every other frame
    const loop30 = () => {
      rafIds.current.r30 = requestAnimationFrame(loop30);
      frame++;
      if (frame % 2 !== 0) return;
      const s = s30.current;
      const dt = 1 / 30;
      s.vy += GRAVITY * dt;
      s.y  += s.vy * dt;
      s.x  += SPEED_X * dt;
      if (s.y >= FLOOR - R) { s.y = FLOOR - R; s.vy *= -BOUNCE; if (Math.abs(s.vy) < 30) s.vy = -GRAVITY * 0.35; }
      if (s.x >= W - R) s.x = R;
      drawRow(cvs30.current, s, C.purple, "30fps (без delta)", "x += SPEED / 30");
    };

    // 60fps
    const loop60 = () => {
      rafIds.current.r60 = requestAnimationFrame(loop60);
      const s = s60.current;
      const dt = 1 / 60;
      s.vy += GRAVITY * dt;
      s.y  += s.vy * dt;
      s.x  += SPEED_X * dt;
      if (s.y >= FLOOR - R) { s.y = FLOOR - R; s.vy *= -BOUNCE; if (Math.abs(s.vy) < 30) s.vy = -GRAVITY * 0.35; }
      if (s.x >= W - R) s.x = R;
      drawRow(cvs60.current, s, C.accent, "60fps (без delta)", "x += SPEED / 60");
    };

    // delta time: same real speed regardless of fps
    const loopDt = (ts) => {
      rafIds.current.rDt = requestAnimationFrame(loopDt);
      const s = sDt.current;
      const delta = s.last ? Math.min(ts - s.last, 50) : 16;
      s.last = ts;
      const dt = delta / 1000;
      s.vy += GRAVITY * dt;
      s.y  += s.vy * dt;
      s.x  += SPEED_X * dt;
      if (s.y >= FLOOR - R) { s.y = FLOOR - R; s.vy *= -BOUNCE; if (Math.abs(s.vy) < 30) s.vy = -GRAVITY * 0.35; }
      if (s.x >= W - R) s.x = R;
      drawRow(cvsDt.current, s, C.green, "delta time ✓", "x += SPEED * (dt/1000)");
    };

    rafIds.current.r30 = requestAnimationFrame(loop30);
    rafIds.current.r60 = requestAnimationFrame(loop60);
    rafIds.current.rDt = requestAnimationFrame(loopDt);

    return () => Object.values(rafIds.current).forEach(cancelAnimationFrame);
  }, []);

  return (
    <div>
      <div style={card}>
        <div style={cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>delta time — однакова швидкість на будь-якому fps</span>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { ref: cvs30, color: C.purple, label: "30fps (без delta)" },
            { ref: cvs60, color: C.accent, label: "60fps (без delta)" },
            { ref: cvsDt, color: C.green,  label: "delta time ✓" },
          ].map(({ ref, color, label }) => (
            <div key={label}>
              <canvas ref={ref} width={W} height={H}
                style={{ width: "100%", borderRadius: 8, display: "block" }} />
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 11, color }}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Code>
<Kw c="let" />{" lastTime = "}<Nm c="0" />{";\n\n"}
<Kw c="function" /> <Pr c="loop" />{"(timestamp) {\n"}
{"  "}<Kw c="const" />{" delta = timestamp - lastTime; "}<Cm c="// ms між кадрами" />{"\n"}
{"  lastTime = timestamp;\n\n"}
{"  "}<Cm c="// px/с — однаково і на 30fps, і на 144fps" />{"\n"}
{"  ball.x += speed * (delta / "}<Nm c="1000" />{");\n"}
{"  ball.vy += gravity * (delta / "}<Nm c="1000" />{");\n\n"}
{"  "}<Pr c="draw" />{"();\n"}
{"  "}<Pr c="requestAnimationFrame" />{"(loop);\n"}
{"}"}
      </Code>

      <div style={{ background: C.surface2, border: `1px solid ${C.yellow}44`, borderRadius: 10, padding: "12px 16px", marginTop: 12, fontSize: 12, lineHeight: 1.8 }}>
        <span style={{ color: C.yellow, fontWeight: 700 }}>💡</span>
        {" 30fps і 60fps м'ячики рухаються з різною швидкістю — бо прив'язані до кадрів. delta time ✓ завжди однаковий."}
      </div>
    </div>
  );
}

// ── Tab 3: pause / visibilitychange ──────────────────────────────────────────
function PauseTab() {
  const cvsRef   = useRef(null);
  const rafRef   = useRef(null);
  const stateRef = useRef({ x: 60, y: 80, vx: 100, vy: 0, last: 0, running: false, frames: 0 });
  const [running, setRunning] = useState(false);
  const [hidden,  setHidden]  = useState(false);
  const [frames,  setFrames]  = useState(0);
  const [fps,     setFps]     = useState(0);
  const fpsRef    = useRef({ count: 0, last: 0 });

  const W = 620, H = 200, R = 18, FLOOR = H - 28;
  const GRAVITY = 800, BOUNCE = 0.75;

  function drawScene(cvs, s) {
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    clearCanvas(ctx, W, H);
    drawGrid(ctx, W, H);
    drawFloor(ctx, W, H);

    // left / right walls
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(R + 2, 10); ctx.lineTo(R + 2, FLOOR + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - R - 2, 10); ctx.lineTo(W - R - 2, FLOOR + 4); ctx.stroke();

    const proximity = Math.max(0, 1 - (FLOOR - s.y) / (FLOOR * 0.35));
    const squash = 1 - proximity * 0.32;
    drawBall(ctx, s.x, s.y, R, C.accent, squash);

    // stats top-right
    ctx.font = "10px 'JetBrains Mono',monospace";
    ctx.textAlign = "right";
    ctx.fillStyle = C.muted;
    ctx.fillText(`frame: ${s.frames}`, W - 12, 18);

    ctx.fillStyle = C.orange;
    ctx.fillText(`vx: ${Math.round(s.vx)}  vy: ${Math.round(s.vy)}`, W - 12, 34);
  }

  const loop = useCallback((ts) => {
    const s = stateRef.current;
    if (!s.running) return;

    const delta = s.last ? Math.min(ts - s.last, 50) : 16;
    s.last = ts;
    const dt = delta / 1000;

    s.vy += GRAVITY * dt;
    s.x  += s.vx * dt;
    s.y  += s.vy * dt;

    // floor bounce
    if (s.y >= FLOOR - R) {
      s.y = FLOOR - R;
      s.vy *= -BOUNCE;
      if (Math.abs(s.vy) < 50) s.vy = -GRAVITY * 0.38;
    }
    // wall bounce
    if (s.x <= R + 2)     { s.x = R + 2;     s.vx = Math.abs(s.vx); }
    if (s.x >= W - R - 2) { s.x = W - R - 2; s.vx = -Math.abs(s.vx); }

    s.frames++;
    setFrames(s.frames);

    // fps counter
    fpsRef.current.count++;
    if (ts - fpsRef.current.last >= 1000) {
      setFps(fpsRef.current.count);
      fpsRef.current.count = 0;
      fpsRef.current.last = ts;
    }

    drawScene(cvsRef.current, s);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  function start() {
    const s = stateRef.current;
    s.running = true; s.last = 0;
    setRunning(true);
    rafRef.current = requestAnimationFrame(loop);
  }
  function stop() {
    stateRef.current.running = false;
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
  }
  function simulateHide() {
    setHidden(true); stop();
    setTimeout(() => { setHidden(false); start(); }, 2000);
  }

  useEffect(() => {
    drawScene(cvsRef.current, stateRef.current);
    return () => { stateRef.current.running = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div>
      <div style={card}>
        <div style={cardHeader}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>зупинка і відновлення</span>
          <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 11 }}>
            <span style={{ color: C.muted }}>fps: <span style={{ color: C.green }}>{fps}</span></span>
            <span style={{ color: C.muted }}>frames: <span style={{ color: C.orange }}>{frames}</span></span>
            <span style={{ color: running ? C.green : C.muted }}>{running ? "● running" : "○ paused"}</span>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <canvas ref={cvsRef} width={W} height={H}
            style={{ width: "100%", borderRadius: 8, display: "block", marginBottom: 14 }} />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={btn(running, C.accent)} onClick={running ? stop : start}>
              {running ? "⏹ cancelAnimationFrame" : "▶ requestAnimationFrame"}
            </button>
            <button style={btn(hidden, C.yellow)} onClick={!hidden ? simulateHide : undefined} disabled={hidden}>
              {hidden ? "⏳ tab hidden... (2s)" : "🙈 simulate tab hidden"}
            </button>
            <button style={{ ...btn(false), marginLeft: "auto" }}
              onClick={() => { stateRef.current.frames = 0; setFrames(0); fpsRef.current.count = 0; setFps(0); }}>
              reset
            </button>
          </div>

          {hidden && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: C.surface2, borderRadius: 8, border: `1px solid ${C.yellow}44`, fontSize: 12, color: C.yellow }}>
              ⏸ вкладка прихована — rAF зупинений автоматично. Відновиться через 2с...
            </div>
          )}
        </div>
      </div>

      <Code>
<Kw c="let" />{" rafId = "}<Nm c="null" />{";\n\n"}
<Kw c="function" /> <Pr c="start" />{"() {\n"}
{"  rafId = "}<Pr c="requestAnimationFrame" />{"(loop);\n"}
{"}\n"}
<Kw c="function" /> <Pr c="stop" />{"() {\n"}
{"  "}<Pr c="cancelAnimationFrame" />{"(rafId); "}<Cm c="// зупиняємо цикл" />{"\n"}
{"  rafId = "}<Nm c="null" />{";\n"}
{"}\n\n"}
<Cm c="// браузер сам зупиняє rAF на прихованій вкладці" />{"\n"}
{"document."}<Pr c="addEventListener" />{"("}<St c="'visibilitychange'" />{", () => {\n"}
{"  document.hidden ? "}<Pr c="stop" />{"() : "}<Pr c="start" />{"();\n"}
{"});"}
      </Code>

      <div style={{ background: C.surface2, border: `1px solid ${C.green}44`, borderRadius: 12, padding: "14px 18px", fontSize: 13, lineHeight: 1.9, marginTop: 12 }}>
        <span style={{ color: C.yellow, fontWeight: 700 }}>💡 Три правила rAF:</span><br />
        <span style={{ color: C.accent }}>1.</span>{" Завжди зберігай id → "}
        <span style={{ color: C.purple, fontFamily: "monospace" }}>cancelAnimationFrame(id)</span><br />
        <span style={{ color: C.accent }}>2.</span>{" Використовуй "}
        <span style={{ color: C.orange, fontFamily: "monospace" }}>delta time</span>
        {" — не залежи від fps<br />"}
        <span style={{ color: C.accent }}>3.</span>{" Слухай "}
        <span style={{ color: C.green, fontFamily: "monospace" }}>visibilitychange</span>
        {" — rAF сам економить CPU"}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function RafDemo() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono','Fira Code',monospace", padding: "28px 22px", minHeight: "100vh", boxSizing: "border-box" }}>
      <style>{`* { box-sizing: border-box; } input[type=range]{cursor:pointer;} *::-webkit-scrollbar{width:5px} *::-webkit-scrollbar-thumb{background:#2a2c4a;border-radius:99px}`}</style>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.accent, margin: "0 0 6px" }}>
          ⚡ requestAnimationFrame
        </h1>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>
          // правильний game loop в браузері
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map((t, i) => (
            <button key={i} style={btn(tab === i)} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>

        {tab === 0 && <CompareTab />}
        {tab === 1 && <DeltaTab />}
        {tab === 2 && <PauseTab />}

      </div>
    </div>
  );
}
