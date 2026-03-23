import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", red: "#ff5f57",
};

// ── Physics engine ────────────────────────────────────────────────────────────
function springStep(pos, vel, target, tension, friction, mass = 1, dt = 0.016) {
  const force = -tension * (pos - target) - friction * vel;
  const acc = force / mass;
  const newVel = vel + acc * dt;
  const newPos = pos + newVel * dt;
  return [newPos, newVel];
}

function useSpringValue(target, tension, friction, mass = 1) {
  const stateRef = useRef({ pos: target, vel: 0 });
  const [val, setVal] = useState(target);
  const rafRef = useRef(null);
  const targetRef = useRef(target);

  useEffect(() => { targetRef.current = target; }, [target]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const [np, nv] = springStep(
        stateRef.current.pos, stateRef.current.vel,
        targetRef.current, tension, friction, mass
      );
      stateRef.current = { pos: np, vel: nv };
      setVal(np);
      const settled = Math.abs(np - targetRef.current) < 0.001 && Math.abs(nv) < 0.001;
      if (!settled) rafRef.current = requestAnimationFrame(tick);
      else setVal(targetRef.current);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, tension, friction, mass]);

  return val;
}

// animate multiple values together
function useSpring(targets, tension, friction, mass = 1) {
  const keys = Object.keys(targets);
  const states = useRef(Object.fromEntries(keys.map(k => [k, { pos: targets[k], vel: 0 }])));
  const [vals, setVals] = useState(targets);
  const rafRef = useRef(null);
  const tRef = useRef(targets);

  useEffect(() => { tRef.current = targets; }, [targets]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      let settled = true;
      const next = {};
      for (const k of keys) {
        const [np, nv] = springStep(
          states.current[k].pos, states.current[k].vel,
          tRef.current[k], tension, friction, mass
        );
        states.current[k] = { pos: np, vel: nv };
        next[k] = np;
        if (Math.abs(np - tRef.current[k]) > 0.001 || Math.abs(nv) > 0.001) settled = false;
      }
      setVals({ ...next });
      if (!settled) rafRef.current = requestAnimationFrame(tick);
      else setVals({ ...tRef.current });
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(targets), tension, friction, mass]);

  return vals;
}

// trail: each item follows previous with delay
function useTrail(count, getTargets, tension, friction) {
  const allStates = useRef(
    Array.from({ length: count }, (_, i) => {
      const t = getTargets(i);
      return Object.fromEntries(Object.keys(t).map(k => [k, { pos: t[k], vel: 0 }]));
    })
  );
  const [vals, setVals] = useState(() =>
    Array.from({ length: count }, (_, i) => getTargets(i))
  );
  const rafRef = useRef(null);
  const tRef = useRef(getTargets);
  const leadRef = useRef(Array.from({ length: count }, (_, i) => getTargets(i)));

  useEffect(() => { tRef.current = getTargets; }, [getTargets]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      let anyMoving = false;
      const nextVals = [];

      for (let i = 0; i < count; i++) {
        const target = i === 0
          ? tRef.current(0)
          : (() => {
              // follow previous item's current position
              const prev = nextVals[i - 1] || vals[i - 1];
              return Object.fromEntries(Object.keys(prev).map(k => [k, prev[k]]));
            })();

        const next = {};
        for (const k of Object.keys(target)) {
          const [np, nv] = springStep(
            allStates.current[i][k]?.pos ?? target[k],
            allStates.current[i][k]?.vel ?? 0,
            target[k], tension, friction
          );
          allStates.current[i][k] = { pos: np, vel: nv };
          next[k] = np;
          if (Math.abs(np - target[k]) > 0.01 || Math.abs(nv) > 0.01) anyMoving = true;
        }
        nextVals.push(next);
      }

      setVals([...nextVals]);
      if (anyMoving) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [JSON.stringify(Array.from({ length: count }, (_, i) => getTargets(i))), tension, friction, count]);

  return vals;
}

// ── Slider ────────────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step = 1, onChange, color = C.accent, unit = "" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
    </div>
  );
}

// ── DEMO 1: useSpring — flip card ─────────────────────────────────────────────
function SpringDemo({ tension, friction, mass }) {
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);

  const vals = useSpring(
    { rotateY: flipped ? 180 : 0, scale: flipped ? 1.06 : 1, y: dragging ? -8 : 0 },
    tension, friction, mass
  );

  const dvals = useSpring({ x: dragX, y: dragY }, tension * 0.4, friction * 0.8, mass);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* flip card */}
      <div style={{ perspective: "800px" }}>
        <div
          onClick={() => setFlipped(f => !f)}
          style={{
            width: 140, height: 90, borderRadius: 12, cursor: "pointer",
            position: "relative",
            transform: `perspective(800px) rotateY(${vals.rotateY}deg) scale(${vals.scale}) translateY(${vals.y}px)`,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* front */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 12,
            background: `linear-gradient(135deg, ${C.accent}44, ${C.accent}22)`,
            border: `1.5px solid ${C.accent}88`,
            backfaceVisibility: "hidden",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            <span style={{ fontSize: 22 }}>◈</span>
            <span style={{ fontSize: 9, color: C.accent }}>click to flip</span>
          </div>
          {/* back */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 12,
            background: `linear-gradient(135deg, ${C.purple}44, ${C.purple}22)`,
            border: `1.5px solid ${C.purple}88`,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            <span style={{ fontSize: 22 }}>✦</span>
            <span style={{ fontSize: 9, color: C.purple }}>flip back</span>
          </div>
        </div>
      </div>

      {/* drag follower */}
      <div style={{ position: "relative", width: 200, height: 60 }}>
        <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginBottom: 8 }}>
          move mouse over →
        </div>
        <div
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect();
            setDragX((e.clientX - r.left - r.width / 2) * 0.4);
            setDragY((e.clientY - r.top - r.height / 2) * 0.4);
          }}
          onMouseLeave={() => { setDragX(0); setDragY(0); }}
          style={{
            position: "relative", width: "100%", height: 40,
            background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}`,
            cursor: "crosshair", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute",
            left: "50%", top: "50%",
            width: 24, height: 24, borderRadius: "50%",
            background: C.green, border: `2px solid ${C.green}`,
            boxShadow: `0 0 12px ${C.green}66`,
            transform: `translate(calc(-50% + ${dvals.x}px), calc(-50% + ${dvals.y}px))`,
            willChange: "transform",
          }} />
        </div>
      </div>

      <div style={{ fontSize: 10, color: C.muted }}>
        <span style={{ color: C.accent }}>rotateY:</span> {vals.rotateY.toFixed(1)}°
        {" · "}
        <span style={{ color: C.purple }}>scale:</span> {vals.scale.toFixed(3)}
      </div>
    </div>
  );
}

// ── DEMO 2: useTrail ──────────────────────────────────────────────────────────
const TRAIL_ITEMS = ["useSpring", "useTrail", "useSprings", "useScroll", "useGesture"];
const TRAIL_COLORS = [C.accent, C.purple, C.green, C.orange, C.yellow];

function TrailDemo({ tension, friction }) {
  const [open, setOpen] = useState(true);

  const getTargets = useCallback((i) => ({
    opacity: open ? 1 : 0,
    x: open ? 0 : -30,
    scale: open ? 1 : 0.85,
  }), [open]);

  const trail = useTrail(TRAIL_ITEMS.length, getTargets, tension, friction);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
        {trail.map((style, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: TRAIL_COLORS[i] + "18",
            border: `1px solid ${TRAIL_COLORS[i]}44`,
            borderRadius: 8, padding: "8px 14px",
            opacity: style.opacity,
            transform: `translateX(${style.x}px) scale(${style.scale})`,
            willChange: "transform, opacity",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: TRAIL_COLORS[i], flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{TRAIL_ITEMS[i]}</span>
            <span style={{ marginLeft: "auto", fontSize: 9, color: TRAIL_COLORS[i] }}>
              hook #{i + 1}
            </span>
          </div>
        ))}
      </div>

      <button onClick={() => setOpen(o => !o)} style={{
        background: open ? C.surface2 : C.green + "22",
        border: `1px solid ${open ? C.border : C.green}`,
        borderRadius: 8, padding: "8px 20px",
        color: open ? C.muted : C.green,
        fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        transition: "border-color 0.2s, color 0.2s",
      }}>
        {open ? "↑ collapse" : "↓ expand"}
      </button>

      <div style={{ fontSize: 10, color: C.muted }}>
        each item follows the previous one — chain reaction
      </div>
    </div>
  );
}

// ── DEMO 3: useSprings — independent ─────────────────────────────────────────
const GRID_ITEMS = Array.from({ length: 9 }, (_, i) => ({
  label: String(i + 1),
  color: [C.accent, C.purple, C.green, C.orange, C.yellow, C.red, C.accent, C.purple, C.green][i],
}));

function SpringsDemo({ tension, friction }) {
  const [active, setActive] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
        width: "100%",
      }}>
        {GRID_ITEMS.map((item, i) => {
          const isActive = active === i;
          const isRowActive = hoveredRow !== null && Math.floor(i / 3) === hoveredRow;

          const scale = useSpringValue(
            isActive ? 1.15 : isRowActive ? 1.06 : 1,
            tension, friction
          );
          const brightness = useSpringValue(
            isActive ? 1 : isRowActive ? 0.8 : 0.5,
            tension * 0.7, friction
          );

          return (
            <div
              key={i}
              onClick={() => setActive(a => a === i ? null : i)}
              onMouseEnter={() => setHoveredRow(Math.floor(i / 3))}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                height: 52, borderRadius: 10, cursor: "pointer",
                background: `rgba(${hexToRgb(item.color)}, ${0.08 + brightness * 0.15})`,
                border: `1.5px solid rgba(${hexToRgb(item.color)}, ${0.2 + brightness * 0.5})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700,
                color: `rgba(${hexToRgb(item.color)}, ${0.5 + brightness * 0.5})`,
                transform: `scale(${scale})`,
                boxShadow: isActive ? `0 0 20px rgba(${hexToRgb(item.color)}, 0.3)` : "none",
                willChange: "transform",
                transition: "box-shadow 0.3s",
                userSelect: "none",
              }}
            >
              {isActive ? "✓" : item.label}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10, color: C.muted, textAlign: "center" }}>
        click = independent spring · hover row = group reaction
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── Presets ───────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: "gentle",   tension: 120, friction: 14, mass: 1   },
  { label: "default",  tension: 170, friction: 26, mass: 1   },
  { label: "wobbly",   tension: 180, friction: 12, mass: 1   },
  { label: "stiff",    tension: 210, friction: 20, mass: 1   },
  { label: "slow",     tension: 280, friction: 60, mass: 1   },
  { label: "heavy",    tension: 200, friction: 30, mass: 3   },
];

// ── Code snippets ─────────────────────────────────────────────────────────────
const CODE = {
  spring: (t, f, m) => `const { rotateY, scale } = useSpring({
  rotateY: flipped ? 180 : 0,
  scale:   flipped ? 1.06 : 1,
  config: {
    tension:  ${t},
    friction: ${f},
    mass:     ${m},
  },
});

<animated.div style={{ rotateY, scale }} />`,

  trail: (t, f) => `const trail = useTrail(items.length, {
  opacity: open ? 1 : 0,
  x:       open ? 0 : -30,
  scale:   open ? 1 : 0.85,
  config: { tension: ${t}, friction: ${f} },
});

return trail.map((style, i) => (
  <animated.div key={i} style={style}>
    {items[i]}
  </animated.div>
));`,

  springs: (t, f) => `const springs = useSprings(items.length,
  items.map((item, i) => ({
    scale:  active === i ? 1.15 : 1,
    config: { tension: ${t}, friction: ${f} },
  }))
);

return springs.map((style, i) => (
  <animated.div style={style}>{items[i]}</animated.div>
));`,
};

function CodeBlock({ code }) {
  const keywords = ["useSpring","useTrail","useSprings","animated","config","tension","friction","mass","opacity","scale","rotateY","x","y"];
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
          {line.split(/(".*?"|\b\d+\.?\d*\b|useSpring|useTrail|useSprings|animated\.div|config|tension|friction|mass|opacity|scale|rotateY|\bx\b|\by\b|open|flipped|active|items|style)/).map((seg, j) => {
            const color =
              /^"/.test(seg) ? C.green :
              /^\d/.test(seg) ? C.orange :
              ["useSpring","useTrail","useSprings"].includes(seg) ? C.purple :
              seg === "animated.div" ? C.purple :
              ["tension","friction","mass","config"].includes(seg) ? C.accent :
              ["opacity","scale","rotateY","x","y"].includes(seg) ? C.yellow :
              ["open","flipped","active"].includes(seg) ? C.orange :
              C.muted;
            return <span key={j} style={{ color }}>{seg}</span>;
          })}
        </div>
      ))}
    </pre>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ReactSpringPlayground() {
  const [demo, setDemo]       = useState("spring");
  const [tension, setTension] = useState(170);
  const [friction, setFriction] = useState(26);
  const [mass, setMass]       = useState(1);
  const [preset, setPreset]   = useState("default");

  const applyPreset = (p) => {
    setPreset(p.label);
    setTension(p.tension);
    setFriction(p.friction);
    setMass(p.mass);
  };

  const DEMOS = [
    { key: "spring",  label: "useSpring",  color: C.accent  },
    { key: "trail",   label: "useTrail",   color: C.purple  },
    { key: "springs", label: "useSprings", color: C.green   },
  ];

  const codeStr = demo === "spring"  ? CODE.spring(tension, friction, mass)
               :  demo === "trail"   ? CODE.trail(tension, friction)
               :                       CODE.springs(tension, friction);

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

      <div style={{ width: "100%", maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
            // physics playground
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
            react-spring
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>
            tension · friction · mass → tweak and feel the difference
          </p>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ── LEFT: controls ── */}
          <div style={{ flex: "0 0 220px", display: "flex", flexDirection: "column", gap: 10 }}>

            {/* physics params */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>// config</div>
              <Slider label="tension" value={tension} min={10} max={500} step={10}
                onChange={t => { setTension(t); setPreset(""); }} color={C.accent} />
              <Slider label="friction" value={friction} min={1} max={80}
                onChange={f => { setFriction(f); setPreset(""); }} color={C.green} />
              {demo === "spring" && (
                <Slider label="mass" value={mass} min={0.5} max={5} step={0.5}
                  onChange={m => { setMass(m); setPreset(""); }} color={C.orange} unit="×" />
              )}

              <div style={{ marginTop: 10, fontSize: 10, color: C.muted, lineHeight: 1.8 }}>
                <span style={{ color: C.accent }}>tension↑</span> = faster pull<br />
                <span style={{ color: C.green }}>friction↓</span> = more bounce<br />
                {demo === "spring" && <><span style={{ color: C.orange }}>mass↑</span> = heavier, overshoots</>}
              </div>
            </div>

            {/* presets */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// presets</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyPreset(p)} style={{
                    background: preset === p.label ? C.accent + "18" : "transparent",
                    border: `1px solid ${preset === p.label ? C.accent : C.border}`,
                    borderRadius: 7, padding: "5px 10px",
                    color: preset === p.label ? C.accent : C.muted,
                    fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "all 0.18s",
                  }}>
                    <span>{p.label}</span>
                    <span style={{ fontSize: 9, opacity: 0.65 }}>{p.tension}/{p.friction}{p.mass > 1 ? `/m${p.mass}` : ""}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: demo + code ── */}
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* demo tabs */}
            <div style={{ display: "flex", gap: 6 }}>
              {DEMOS.map(d => (
                <button key={d.key} onClick={() => setDemo(d.key)} style={{
                  flex: 1,
                  background: demo === d.key ? d.color + "22" : "transparent",
                  border: `1px solid ${demo === d.key ? d.color : C.border}`,
                  borderRadius: 8, padding: "7px 6px",
                  color: demo === d.key ? d.color : C.muted,
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}>{d.label}</button>
              ))}
            </div>

            {/* preview */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "24px 20px",
              minHeight: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* subtle grid */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.3,
                backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 31px,${C.border} 31px,${C.border} 32px),repeating-linear-gradient(90deg,transparent,transparent 31px,${C.border} 31px,${C.border} 32px)`,
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative", width: "100%" }}>
                {demo === "spring"  && <SpringDemo  tension={tension} friction={friction} mass={mass} />}
                {demo === "trail"   && <TrailDemo   tension={tension} friction={friction} />}
                {demo === "springs" && <SpringsDemo tension={tension} friction={friction} />}
              </div>
            </div>

            {/* live values */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "8px 14px",
              display: "flex", gap: 16, fontSize: 10,
            }}>
              <span style={{ color: C.muted }}>config:</span>
              <span><span style={{ color: C.accent }}>tension</span> {tension}</span>
              <span><span style={{ color: C.green }}>friction</span> {friction}</span>
              {demo === "spring" && <span><span style={{ color: C.orange }}>mass</span> {mass}×</span>}
            </div>

            {/* code */}
            <CodeBlock code={codeStr} />
          </div>
        </div>

        {/* bottom: comparison table */}
        <div style={{
          marginTop: 14, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "14px 18px",
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>
            // react-spring vs Framer Motion
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 0, fontSize: 10,
          }}>
            {[
              ["",               "react-spring",     "Framer Motion"],
              ["physics param",  "tension/friction", "stiffness/damping"],
              ["mass",           "✓ supported",      "✗ no equivalent"],
              ["color anim",     "✓ native",         "⚠ limited"],
              ["SVG path",       "✓ interpolates",   "⚠ limited"],
              ["gestures",       "useGesture",       "✓ built-in"],
              ["exit anim",      "⚠ manual",         "✓ AnimatePresence"],
            ].map(([a, b, cc], i) => (
              [
                <div key={`a${i}`} style={{ color: i===0?C.text:C.muted, padding:"5px 8px", borderBottom: i<6?`1px solid ${C.border}`:"none", fontWeight: i===0?700:400 }}>{a}</div>,
                <div key={`b${i}`} style={{ color: i===0?C.purple:C.text, padding:"5px 8px", borderLeft:`1px solid ${C.border}`, borderBottom: i<6?`1px solid ${C.border}`:"none", fontWeight: i===0?700:400, textAlign:"center" }}>{b}</div>,
                <div key={`c${i}`} style={{ color: i===0?C.accent:C.text, padding:"5px 8px", borderLeft:`1px solid ${C.border}`, borderBottom: i<6?`1px solid ${C.border}`:"none", fontWeight: i===0?700:400, textAlign:"center" }}>{cc}</div>,
              ]
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
