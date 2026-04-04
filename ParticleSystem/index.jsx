import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

const COLORS_RGB = ["125,207,255", "187,154,247", "158,206,106"];
const MODES = ["lines", "dots", "mouse"];

function makeParticle(W, H, speedMult) {
  const angle = Math.random() * Math.PI * 2;
  const speed = (Math.random() * 1.2 + 0.3) * speedMult;
  return {
    x: Math.random() * W, y: Math.random() * H,
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    r: Math.random() * 2.5 + 1,
    alpha: Math.random() * 0.5 + 0.4,
    colorIdx: Math.floor(Math.random() * 3),
  };
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function Stat({ label, value, color }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// ─── Slider control ──────────────────────────────────────────────────────────
function SliderCtrl({ label, min, max, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label style={{ fontSize: 11, color: C.muted }}>{label}</label>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: 90, accentColor: C.accent, cursor: "pointer" }}
      />
      <span style={{ fontSize: 12, color: C.orange, minWidth: 32 }}>{value}</span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ParticleSystem() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [], mode: "lines", maxDist: 100,
    speedMult: 1.0, targetCount: 80,
    mouse: { x: -9999, y: -9999 },
    W: 0, H: 380,
    frameCount: 0, lastFpsTime: performance.now(),
    running: true,
  });
  const rafRef = useRef(null);

  const [count, setCountState] = useState(80);
  const [speedRaw, setSpeedRaw] = useState(10);
  const [dist, setDistState] = useState(100);
  const [mode, setModeState] = useState("lines");
  const [fps, setFps] = useState(60);
  const [lineCount, setLineCount] = useState(0);

  const speedDisplay = (speedRaw / 10).toFixed(1);

  // ── resize ──
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const W = Math.floor(rect.width || 600);
    stateRef.current.W = W;
    canvas.width = W;
    canvas.height = 380;
  }, []);

  // ── reset particles ──
  const resetParticles = useCallback(() => {
    const { W, H, targetCount, speedMult } = stateRef.current;
    stateRef.current.particles = Array.from({ length: targetCount }, () =>
      makeParticle(W, H, speedMult)
    );
  }, []);

  // ── draw loop ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current.running) return;

    const ctx = canvas.getContext("2d");
    const st = stateRef.current;
    const { W, H, particles, mode, maxDist, mouse } = st;

    ctx.clearRect(0, 0, W, H);

    // fps
    st.frameCount++;
    const now = performance.now();
    if (now - st.lastFpsTime >= 1000) {
      const f = Math.round(st.frameCount * 1000 / (now - st.lastFpsTime));
      setFps(f);
      st.frameCount = 0;
      st.lastFpsTime = now;
    }

    // mouse attract
    if (mode === "mouse") {
      particles.forEach(p => {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 180 && d > 0) {
          p.vx += (dx / d) * 0.08;
          p.vy += (dy / d) * 0.08;
          const mag = Math.hypot(p.vx, p.vy);
          if (mag > 3) { p.vx = p.vx / mag * 3; p.vy = p.vy / mag * 3; }
        }
      });
    }

    // update positions
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      p.x = Math.max(0, Math.min(W, p.x));
      p.y = Math.max(0, Math.min(H, p.y));
    });

    // connections
    let lc = 0;
    if (mode !== "dots") {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxDist) {
            const op = (1 - d / maxDist) * 0.5;
            ctx.strokeStyle = `rgba(187,154,247,${op})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            lc++;
          }
        }
      }
    }
    setLineCount(lc);

    // dots
    particles.forEach(p => {
      const c = COLORS_RGB[p.colorIdx];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c},${p.alpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c},0.06)`;
      ctx.fill();
    });

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  // ── init ──
  useEffect(() => {
    resize();
    resetParticles();
    rafRef.current = requestAnimationFrame(draw);

    const handleResize = () => { resize(); };
    window.addEventListener("resize", handleResize);
    return () => {
      stateRef.current.running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ── mouse ──
  const handleMouseMove = useCallback(e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const scaleX = stateRef.current.W / r.width;
    const scaleY = stateRef.current.H / r.height;
    stateRef.current.mouse = {
      x: (e.clientX - r.left) * scaleX,
      y: (e.clientY - r.top) * scaleY,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.mouse = { x: -9999, y: -9999 };
  }, []);

  // ── controls ──
  const handleCount = (v) => {
    setCountState(v);
    stateRef.current.targetCount = v;
    const { W, H, speedMult, particles } = stateRef.current;
    while (particles.length < v) particles.push(makeParticle(W, H, speedMult));
    if (particles.length > v) particles.length = v;
  };

  const handleSpeed = (v) => {
    setSpeedRaw(v);
    const s = v / 10;
    stateRef.current.speedMult = s;
    stateRef.current.particles.forEach(p => {
      const mag = Math.hypot(p.vx, p.vy) || 0.001;
      p.vx = (p.vx / mag) * s * (Math.random() * 0.8 + 0.6);
      p.vy = (p.vy / mag) * s * (Math.random() * 0.8 + 0.6);
    });
  };

  const handleDist = (v) => {
    setDistState(v);
    stateRef.current.maxDist = v;
  };

  const handleMode = (m) => {
    setModeState(m);
    stateRef.current.mode = m;
  };

  const handleReset = () => {
    resize();
    resetParticles();
  };

  // ── styles ──
  const btnStyle = (id) => ({
    background: mode === id ? C.accent + "22" : "transparent",
    border: `1px solid ${mode === id ? C.accent : C.border}`,
    borderRadius: 8, padding: "7px 16px",
    fontSize: 12, fontFamily: "inherit",
    color: mode === id ? C.accent : C.muted,
    cursor: "pointer", transition: "all .15s",
  });

  return (
    <div style={{
      background: C.bg, color: C.text, minHeight: "100vh",
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      padding: "28px 22px", boxSizing: "border-box",
    }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input[type=range]{cursor:pointer;} *::-webkit-scrollbar{width:5px} *::-webkit-scrollbar-thumb{background:#2a2c4a;border-radius:99px}`}</style>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.accent, marginBottom: 6 }}>✦ Particle System</h1>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>// Canvas API — 50 рядків коду</p>

        {/* Demo card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: C.surface2, padding: "11px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>canvas demo</span>
            <span style={{ fontSize: 11, color: C.green }}>{fps} fps</span>
          </div>
          <div style={{ padding: 20 }}>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
              <Stat label="// частинки"  value={count}        color={C.accent}  />
              <Stat label="// з'єднань"  value={lineCount}    color={C.purple}  />
              <Stat label="// швидкість" value={speedDisplay} color={C.orange}  />
              <Stat label="// режим"     value={mode}         color={C.green}   />
            </div>

            {/* Sliders */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, alignItems: "center" }}>
              <SliderCtrl label="particles"    min={20}  max={200} value={count}    onChange={handleCount} />
              <SliderCtrl label="speed"        min={1}   max={30}  value={speedRaw} onChange={handleSpeed} />
              <SliderCtrl label="connect dist" min={40}  max={200} value={dist}     onChange={handleDist}  />
            </div>

            {/* Mode buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {MODES.map(m => (
                <button key={m} onClick={() => handleMode(m)} style={btnStyle(m)}>{m}</button>
              ))}
              <button
                onClick={handleReset}
                style={{
                  marginLeft: "auto", background: "transparent",
                  border: `1px solid ${C.red}44`, borderRadius: 8,
                  padding: "7px 16px", fontSize: 12, fontFamily: "inherit",
                  color: C.red, cursor: "pointer", transition: "all .15s",
                }}
              >
                reset
              </button>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              height={380}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ display: "block", width: "100%", borderRadius: 8, background: C.surface2 }}
            />
          </div>
        </div>

        {/* Code card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: C.surface2, padding: "11px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.purple }}>// core loop</span>
            <span style={{ fontSize: 11, color: C.muted }}>animate.js</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ background: C.surface2, borderRadius: 8, padding: "14px 18px", fontSize: 12, lineHeight: 1.9, borderLeft: `2px solid ${C.purple}`, fontFamily: "inherit" }}>
              <span style={{ color: C.purple }}>function</span>{" "}
              <span style={{ color: C.accent }}>animate</span>{"() {"}<br />
              {"  "}ctx.<span style={{ color: C.accent }}>clearRect</span>(
              <span style={{ color: C.orange }}>0</span>, <span style={{ color: C.orange }}>0</span>, canvas.width, canvas.height);<br />
              <br />
              {"  "}particles.<span style={{ color: C.accent }}>forEach</span>{"(p => {"}<br />
              {"    "}p.x += p.vx; p.y += p.vy;{" "}
              <span style={{ color: C.muted, fontStyle: "italic" }}>// рухаємо</span><br />
              {"    "}<span style={{ color: C.purple }}>if</span>{" (p.x < "}
              <span style={{ color: C.orange }}>0</span>{" || p.x > W) p.vx *= -"}
              <span style={{ color: C.orange }}>1</span>;{" "}
              <span style={{ color: C.muted, fontStyle: "italic" }}>// відбиваємо</span><br />
              {"    "}<span style={{ color: C.purple }}>if</span>{" (p.y < "}
              <span style={{ color: C.orange }}>0</span>{" || p.y > H) p.vy *= -"}
              <span style={{ color: C.orange }}>1</span>;<br />
              {"    "}ctx.<span style={{ color: C.accent }}>arc</span>(p.x, p.y, p.r,{" "}
              <span style={{ color: C.orange }}>0</span>, Math.PI *{" "}
              <span style={{ color: C.orange }}>2</span>);<br />
              {"    "}ctx.<span style={{ color: C.accent }}>fill</span>();<br />
              {"  "}{"});"}<br />
              <br />
              {"  "}<span style={{ color: C.accent }}>requestAnimationFrame</span>(animate);{" "}
              <span style={{ color: C.muted, fontStyle: "italic" }}>// loop ♾</span><br />
              {"}"}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div style={{ background: C.surface2, border: `1px solid ${C.yellow}44`, borderRadius: 12, padding: "18px 20px", fontSize: 13, lineHeight: 1.9 }}>
          <span style={{ color: C.yellow, fontWeight: 700 }}>💡 Три кроки ігрового циклу:</span><br />
          <span style={{ color: C.accent }}>clearRect</span>{" → очищуємо кадр  |  "}
          <span style={{ color: C.purple }}>update</span>{" → оновлюємо позиції  |  "}
          <span style={{ color: C.green }}>draw</span>{" → малюємо заново"}<br />
          <span style={{ color: C.muted }}>requestAnimationFrame синхронізується з монітором — 60fps безкоштовно 🎯</span>
        </div>

      </div>
    </div>
  );
}
