import { useState, useRef, useEffect, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

const CANVAS_W = 600;
const CANVAS_H = 400;

// ── presets ───────────────────────────────────────────────────────────────────
const PRESETS = {
  explosion: {
    label: "💥 вибух", color: C.orange, continuous: false, hint: "клікай на canvas",
    spawn: (x, y, countMul = 1) => Array.from({ length: Math.round(60 * countMul) }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 10;
      return {
        x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
        life: 1, maxLife: 1, radius: 3 + Math.random() * 6,
        color: [C.orange, C.yellow, C.red, "#ffffff"][Math.floor(Math.random() * 4)],
        gravity: 0.18, drag: 0.97, bounce: 0.35,
      };
    }),
  },

  fire: {
    label: "🔥 вогонь", color: C.red, continuous: true,
    hint: "клікай щоб змістити",
    // v1 fire logic — 1 particle per spawn call, but called every frame
    // wider spread via x offset range
    spawn: (x, y) => [{
      x: x + (Math.random() - 0.5) * 160,  // wider base
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(2 + Math.random() * 3),
      life: 0.6 + Math.random() * 0.4,
      maxLife: 1,
      radius: 6 + Math.random() * 8,
      color: [C.red, C.orange, C.yellow][Math.floor(Math.random() * 3)],
      gravity: -0.05, drag: 0.97, bounce: 0,
      isfire: true,
    }],
  },

  snow: {
    label: "❄️ сніг", color: C.accent, continuous: true,
    hint: "клікай щоб додати хуртовину",
    spawn: (x, y) => [{
      x: x !== undefined ? x + (Math.random() - 0.5) * 60 : Math.random() * CANVAS_W,
      y: -10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 0.5 + Math.random() * 1.5,
      life: 1, maxLife: 1,
      radius: 2 + Math.random() * 4,
      color: C.accent,
      gravity: 0.01, drag: 0.995, bounce: 0,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.03 + Math.random() * 0.02,
    }],
  },

  confetti: {
    label: "🎉 конфеті", color: C.purple, continuous: false, hint: "клікай на canvas",
    spawn: (x, y, countMul = 1) => Array.from({ length: Math.round(80 * countMul) }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      const colors = [C.purple, C.accent, C.green, C.orange, C.yellow, C.red];
      return {
        x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 5,
        life: 1, maxLife: 1, radius: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.2, drag: 0.99, bounce: 0.5,
        spin: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI * 2,
        isRect: Math.random() > 0.5,
      };
    }),
  },
};

// ── update ────────────────────────────────────────────────────────────────────
function updateParticle(p) {
  if (p.wobble !== undefined) {
    p.wobble += p.wobbleSpeed;
    p.vx = Math.sin(p.wobble) * 0.8;
  }
  if (p.angle !== undefined && p.spin !== undefined) p.angle += p.spin;

  p.x  += p.vx;
  p.y  += p.vy;
  p.vy += p.gravity;
  p.vx *= p.drag;
  p.vy *= p.drag;
  p.life   -= 0.008 + Math.random() * 0.004;
  p.radius *= 0.995;

  // fire: die when out of top or sides
  if (p.isfire) {
    if (p.y < -80 || p.x < -60 || p.x > CANVAS_W + 60) p.life = 0;
    return;
  }

  // snow: die at bottom
  if (p.gravity > 0 && p.bounce === 0) {
    if (p.y > CANVAS_H + 20) p.life = 0;
    return;
  }

  // bouncing particles
  if (p.bounce > 0) {
    if (p.x - p.radius < 0)        { p.x = p.radius;            p.vx =  Math.abs(p.vx) * p.bounce; }
    if (p.x + p.radius > CANVAS_W) { p.x = CANVAS_W - p.radius; p.vx = -Math.abs(p.vx) * p.bounce; }
    if (p.y + p.radius > CANVAS_H) { p.y = CANVAS_H - p.radius; p.vy = -Math.abs(p.vy) * p.bounce; }
  }
}

function drawParticle(ctx, p) {
  const alpha = Math.max(0, Math.min(1, p.life / (p.maxLife || 1)));
  ctx.globalAlpha = alpha;

  if (p.isRect) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle || 0);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.radius, -p.radius / 2, p.radius * 2, p.radius);
    ctx.restore();
  } else {
    const r = Math.max(0.5, p.radius);
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grad.addColorStop(0, p.color + "ff");
    grad.addColorStop(1, p.color + "00");
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Slider ────────────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, onChange, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: C.muted }}>{label}</span>
        <span style={{ fontSize: 10, color: color || C.accent }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color || C.accent, cursor: "pointer" }} />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function ParticleDemo() {
  const [preset, setPreset]   = useState("explosion");
  const [gravity, setGravity] = useState(100);
  const [count, setCount]     = useState(60);
  const [paused, setPaused]   = useState(false);
  const [fps, setFps]         = useState(0);

  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef    = useRef(null);
  const spawnPos  = useRef({ x: CANVAS_W / 2, y: CANVAS_H - 20 });
  const fpsRef    = useRef({ frames: 0, last: performance.now() });

  const pausedRef  = useRef(false);
  const presetRef  = useRef(preset);
  const gravityRef = useRef(gravity);
  const countRef   = useRef(count);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    presetRef.current = preset;
    spawnPos.current = { x: CANVAS_W / 2, y: CANVAS_H - 20 };
    particles.current = [];
  }, [preset]);
  useEffect(() => { gravityRef.current = gravity; }, [gravity]);
  useEffect(() => { countRef.current = count; }, [count]);

  // HiDPI
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ratio = window.devicePixelRatio || 1;
    cv.width  = CANVAS_W * ratio;
    cv.height = CANVAS_H * ratio;
  }, []);

  const spawnParticles = useCallback((x, y) => {
    const cfg      = PRESETS[presetRef.current];
    const gravMul  = gravityRef.current / 100;
    const countMul = countRef.current / 60;
    const newP = cfg.spawn(x, y, countMul).map(p => ({
      ...p,
      gravity: p.gravity * gravMul,
    }));
    particles.current = [...particles.current, ...newP].slice(-500);
  }, []);

  // rAF loop
  useEffect(() => {
    let frame = 0;

    function loop(ts) {
      const cv = canvasRef.current;
      if (!cv) { rafRef.current = requestAnimationFrame(loop); return; }

      const ratio = window.devicePixelRatio || 1;
      const ctx   = cv.getContext("2d");

      ctx.save();
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // grid
      ctx.strokeStyle = "#1a1b2e"; ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke(); }
      for (let y = 0; y <= CANVAS_H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke(); }
      ctx.strokeStyle = C.border;
      ctx.beginPath(); ctx.moveTo(0, CANVAS_H - 1); ctx.lineTo(CANVAS_W, CANVAS_H - 1); ctx.stroke();

      if (!pausedRef.current) {
        const cfg = PRESETS[presetRef.current];
        frame++;

        if (cfg.continuous) {
          // fire and snow: spawn every 3rd frame to keep count stable
          if (frame % 3 === 0) {
            const pos = cfg.label.includes("вогонь")
              ? spawnPos.current
              : { x: undefined, y: -10 };
            spawnParticles(pos.x, pos.y);
          }
        }

        particles.current = particles.current.filter(p => p.life > 0 && p.radius > 0.1);
        particles.current.forEach(p => updateParticle(p));
      }

      particles.current.forEach(p => drawParticle(ctx, p));

      ctx.globalAlpha = 1;
      ctx.fillStyle = C.muted;
      ctx.font = "11px monospace";
      ctx.fillText(`particles: ${particles.current.length}`, 10, 20);

      ctx.restore();

      fpsRef.current.frames++;
      const now = performance.now();
      if (now - fpsRef.current.last >= 600) {
        setFps(Math.round(fpsRef.current.frames / ((now - fpsRef.current.last) / 1000)));
        fpsRef.current = { frames: 0, last: now };
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [spawnParticles]);

  const handleCanvasClick = (e) => {
    const cv = canvasRef.current;
    const r  = cv.getBoundingClientRect();
    const x  = (e.clientX - r.left) * (CANVAS_W / r.width);
    const y  = (e.clientY - r.top)  * (CANVAS_H / r.height);
    const cfg = PRESETS[preset];
    if (cfg.continuous) {
      spawnPos.current = { x, y };
    } else {
      spawnParticles(x, y);
    }
  };

  const cfg = PRESETS[preset];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
      userSelect: "none", boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%", maxWidth: 680,
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
      }}>
        {/* header */}
        <div style={{
          background: C.surface2, borderBottom: `1px solid ${C.border}`,
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          {Object.entries(PRESETS).map(([key, val]) => (
            <button key={key} onClick={() => setPreset(key)} style={{
              padding: "4px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              fontFamily: "inherit",
              border: `1px solid ${preset === key ? val.color : C.border}`,
              background: preset === key ? val.color + "22" : "transparent",
              color: preset === key ? val.color : C.muted,
              transition: "all 0.15s",
            }}>{val.label}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: fps >= 55 ? C.green : fps >= 30 ? C.yellow : C.red }}>{fps} fps</span>
            <button onClick={() => setPaused(p => !p)} style={{
              padding: "3px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
              fontFamily: "inherit",
              border: `1px solid ${paused ? cfg.color : C.red}`,
              background: paused ? cfg.color + "22" : C.red + "22",
              color: paused ? cfg.color : C.red,
              transition: "all 0.15s",
            }}>{paused ? "▶" : "⏸"}</button>
          </div>
        </div>

        {/* canvas */}
        <div style={{ background: "#0d1117", cursor: "crosshair" }}>
          <canvas ref={canvasRef}
            style={{ display: "block", width: CANVAS_W, height: CANVAS_H, maxWidth: "100%" }}
            onClick={handleCanvasClick} />
        </div>

        {/* sliders */}
        <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Slider label="gravity" value={gravity} min={0} max={200} onChange={setGravity} color={cfg.color} />
          <Slider label="count"   value={count}   min={10} max={150} onChange={setCount}   color={cfg.color} />
        </div>

        {/* footer */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "8px 16px", fontSize: 11, color: C.muted,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ color: cfg.color }}>👆</span>
          <span>{cfg.hint}</span>
          <span style={{ marginLeft: "auto" }}>gravity: {(gravity / 100 * 0.4).toFixed(2)} · count: {count}</span>
        </div>
      </div>
    </div>
  );
}
