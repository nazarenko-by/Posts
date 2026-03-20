import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", red: "#ff5f57",
};

// ── Mini spring/tween physics engine (no framer-motion dependency) ────────────
function springStep(pos, vel, target, stiffness, damping, dt = 0.016) {
  const force = -stiffness * (pos - target) - damping * vel;
  const newVel = vel + force * dt;
  const newPos = pos + newVel * dt;
  return [newPos, newVel];
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t)  { return t * t * t; }
function easeInOut(t)    { return t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }
function easeOut(t)      { return 1 - Math.pow(1 - t, 2); }
function easeIn(t)       { return t * t; }
function linear(t)       { return t; }
function backOut(t)      { const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); }
function elasticOut(t)   {
  if (t === 0 || t === 1) return t;
  return Math.pow(2,-10*t)*Math.sin((t*10-0.75)*(2*Math.PI)/3)+1;
}

const EASINGS = {
  easeOut, easeIn, easeInOut, linear, backOut, elasticOut,
};

// ── useAnimation hook ─────────────────────────────────────────────────────────
function useAnimation(config, trigger) {
  const [values, setValues] = useState({ x: 0, opacity: 1, scale: 1, rotate: 0 });
  const rafRef   = useRef(null);
  const stateRef = useRef({ phase: "idle" }); // idle | to | from

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);

    if (config.type === "spring") {
      // spring physics
      const targets = { x: 120, opacity: 1, scale: 1.1, rotate: config.rotate ? 10 : 0 };
      const state = {
        x: [0, 0], opacity: [1, 0], scale: [1, 0],
        rotate: [0, 0],
      };

      let phase = "to"; // to → from → to ...
      let phaseStart = null;

      const tick = (ts) => {
        if (!phaseStart) phaseStart = ts;
        const dt = Math.min((ts - phaseStart) / 1000, 0.05);
        phaseStart = ts;

        const tgt = phase === "to"
          ? targets
          : { x: 0, opacity: 1, scale: 1, rotate: 0 };

        let done = true;
        const next = {};

        for (const k of ["x", "opacity", "scale", "rotate"]) {
          const [pos, vel] = springStep(
            state[k][0], state[k][1], tgt[k],
            config.stiffness, config.damping, dt
          );
          state[k] = [pos, vel];
          next[k] = pos;
          if (Math.abs(pos - tgt[k]) > 0.001 || Math.abs(vel) > 0.001) done = false;
        }

        setValues({ ...next });

        if (done) {
          phaseStart = null;
          phase = phase === "to" ? "from" : "to";
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

    } else {
      // tween
      const dur = config.duration * 1000;
      const easeFn = EASINGS[config.easing] || easeOut;
      let startTs = null;
      let phase = "to";

      const from = { x: 0, opacity: 1, scale: 1, rotate: 0 };
      const to   = { x: 120, opacity: 1, scale: 1.1, rotate: config.rotate ? 10 : 0 };

      const tick = (ts) => {
        if (!startTs) startTs = ts;
        const elapsed = ts - startTs;
        const raw = Math.min(elapsed / dur, 1);
        const p = easeFn(raw);

        const src = phase === "to" ? from : to;
        const dst = phase === "to" ? to   : from;

        setValues({
          x:       src.x       + (dst.x       - src.x)       * p,
          opacity: src.opacity + (dst.opacity - src.opacity) * p,
          scale:   src.scale   + (dst.scale   - src.scale)   * p,
          rotate:  src.rotate  + (dst.rotate  - src.rotate)  * p,
        });

        if (raw < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          startTs = null;
          phase = phase === "to" ? "from" : "to";
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return values;
}

// ── Slider ────────────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step = 1, onChange, color = C.accent, unit = "" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer" }}
      />
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children, color }) {
  return (
    <button onClick={onClick} style={{
      background: active ? (color || C.accent) + "22" : "transparent",
      border: `1px solid ${active ? (color || C.accent) : C.border}`,
      borderRadius: 7, padding: "6px 16px",
      color: active ? (color || C.accent) : C.muted,
      fontSize: 12, cursor: "pointer", fontFamily: "inherit",
      transition: "all 0.2s",
    }}>{children}</button>
  );
}

// ── Animated box ──────────────────────────────────────────────────────────────
function AnimBox({ values, color, label }) {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 12,
      background: `linear-gradient(135deg, ${color}cc, ${color}66)`,
      border: `2px solid ${color}`,
      boxShadow: `0 0 20px ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 700, color: C.bg,
      fontFamily: "JetBrains Mono, monospace",
      transform: `translateX(${values.x}px) scale(${values.scale}) rotate(${values.rotate}deg)`,
      opacity: values.opacity,
      willChange: "transform, opacity",
    }}>
      {label}
    </div>
  );
}



// ── Main ──────────────────────────────────────────────────────────────────────
export default function FramerPlayground() {
  const [transType, setTransType] = useState("spring");
  const [stiffness, setStiffness] = useState(300);
  const [damping,   setDamping]   = useState(20);
  const [duration,  setDuration]  = useState(0.4);
  const [easing,    setEasing]    = useState("easeOut");
  const [rotate,    setRotate]    = useState(false);
  const [trigger,   setTrigger]   = useState(0);
  const [demo,      setDemo]      = useState("basic"); // basic | stagger | whileHover

  const config = { type: transType, stiffness, damping, duration, easing, rotate };
  const anim = useAnimation(config, trigger);

  // stagger demo — 4 boxes with offset starts
  const staggerConfigs = [0, 1, 2, 3].map(i => ({
    ...config,
    staggerOffset: i * (transType === "spring" ? 150 : duration * 250),
  }));

  const DEMOS = [
    { key: "basic",      label: "basic" },
    { key: "stagger",    label: "stagger" },
    { key: "whileHover", label: "whileHover" },
  ];

  const BOX_COLORS = [C.accent, C.purple, C.green, C.orange];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "26px 18px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <style>{`
        input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:#2a2c4a;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#c0caf5;border:2px solid #2a2c4a;cursor:pointer;transition:transform .15s,background .15s}
        input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.25);background:#7dcfff}
        input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#c0caf5;border:2px solid #2a2c4a;cursor:pointer}
        .hover-box:hover { transform: scale(1.08) translateY(-4px) !important; box-shadow: 0 12px 32px rgba(125,207,255,0.3) !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
            // animation playground
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
            Framer Motion
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>
            tweak parameters → see result live
          </p>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ── LEFT: controls ── */}
          <div style={{ flex: "0 0 240px", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* transition type */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// transition type</div>
              <div style={{ display: "flex", gap: 6 }}>
                <TabBtn active={transType === "spring"} onClick={() => setTransType("spring")} color={C.accent}>spring</TabBtn>
                <TabBtn active={transType === "tween"}  onClick={() => setTransType("tween")}  color={C.purple}>tween</TabBtn>
              </div>
            </div>

            {/* spring params */}
            {transType === "spring" && (
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>// spring params</div>
                <Slider label="stiffness" value={stiffness} min={10} max={800} step={10}
                  onChange={setStiffness} color={C.accent} />
                <Slider label="damping" value={damping} min={1} max={60}
                  onChange={setDamping} color={C.green} />

                <div style={{ marginTop: 8, fontSize: 10, color: C.muted, lineHeight: 1.7 }}>
                  <span style={{ color: C.accent }}>stiffness↑</span> = snappier<br />
                  <span style={{ color: C.green  }}>damping↓</span>  = more bounce
                </div>
              </div>
            )}

            {/* tween params */}
            {transType === "tween" && (
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>// tween params</div>
                <Slider label="duration" value={duration} min={0.1} max={2} step={0.05}
                  onChange={setDuration} color={C.purple} unit="s" />

                <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>easing</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {Object.keys(EASINGS).map(e => (
                    <button key={e} onClick={() => setEasing(e)} style={{
                      background: easing === e ? C.purple + "22" : "transparent",
                      border: `1px solid ${easing === e ? C.purple : C.border}`,
                      borderRadius: 5, padding: "3px 9px",
                      color: easing === e ? C.purple : C.muted,
                      fontSize: 10, cursor: "pointer", fontFamily: "inherit",
                    }}>{e}</button>
                  ))}
                </div>
              </div>
            )}

            {/* extras */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// extras</div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, color: C.text }}>
                <input type="checkbox" checked={rotate} onChange={e => setRotate(e.target.checked)}
                  style={{ accentColor: C.yellow, width: 13, height: 13 }} />
                rotate: 10°
              </label>
            </div>
          </div>

          {/* ── RIGHT: preview + code ── */}
          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* demo selector */}
            <div style={{ display: "flex", gap: 6 }}>
              {DEMOS.map(d => (
                <TabBtn key={d.key} active={demo === d.key}
                  onClick={() => setDemo(d.key)} color={C.yellow}>
                  {d.label}
                </TabBtn>
              ))}
            </div>

            {/* preview area */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "24px 20px",
              minHeight: 160,
              display: "flex", alignItems: "center",
              justifyContent: demo === "stagger" ? "flex-start" : "center",
              flexDirection: demo === "stagger" ? "column" : "row",
              gap: demo === "stagger" ? 10 : 0,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* grid lines */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, ${C.border}44 39px, ${C.border}44 40px),
                                  repeating-linear-gradient(90deg, transparent, transparent 39px, ${C.border}44 39px, ${C.border}44 40px)`,
                opacity: 0.4, pointerEvents: "none",
              }} />

              {demo === "basic" && (
                <AnimBox values={anim} color={C.accent} label="div" />
              )}

              {demo === "stagger" && (
                <StaggerDemo config={config} colors={BOX_COLORS} />
              )}

              {demo === "whileHover" && (
                <HoverDemo color={C.purple} />
              )}
            </div>

            {/* code preview */}
            <CodeSnippet type={transType} stiffness={stiffness} damping={damping}
              duration={duration} easing={easing} rotate={rotate} demo={demo} />

            {/* restart button */}
            {demo !== "whileHover" && (
              <button onClick={() => setTrigger(t => t + 1)} style={{
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "8px",
                color: C.muted, fontSize: 11,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}>
                ↺ restart animation
              </button>
            )}
          </div>
        </div>

        {/* bottom: spring presets */}
        <div style={{
          marginTop: 14,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "14px 18px",
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// spring presets</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "gentle",  s: 100, d: 20 },
              { label: "default", s: 300, d: 20 },
              { label: "snappy",  s: 500, d: 30 },
              { label: "bouncy",  s: 300, d: 8  },
              { label: "stiff",   s: 700, d: 40 },
              { label: "wobbly",  s: 150, d: 5  },
            ].map(p => (
              <button key={p.label} onClick={() => {
                setTransType("spring");
                setStiffness(p.s);
                setDamping(p.d);
                setTrigger(t => t + 1);
              }} style={{
                background: stiffness === p.s && damping === p.d && transType === "spring"
                  ? C.accent + "22" : "transparent",
                border: `1px solid ${stiffness === p.s && damping === p.d && transType === "spring"
                  ? C.accent : C.border}`,
                borderRadius: 7, padding: "5px 14px",
                color: stiffness === p.s && damping === p.d && transType === "spring"
                  ? C.accent : C.muted,
                fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}>
                {p.label}
                <span style={{ marginLeft: 5, fontSize: 9, opacity: 0.6 }}>
                  {p.s}/{p.d}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Stagger demo ──────────────────────────────────────────────────────────────
function StaggerDemo({ config, colors }) {
  const [tick, setTick] = useState(0);
  const [positions, setPositions] = useState([0, 0, 0, 0]);
  const [scales, setScales]       = useState([1, 1, 1, 1]);
  const rafRefs = useRef([null, null, null, null]);

  useEffect(() => {
    const delays = [0, 120, 240, 360];
    const phase = { dirs: ["to","to","to","to"] };
    const states = [
      { x: 0, vel: 0 }, { x: 0, vel: 0 }, { x: 0, vel: 0 }, { x: 0, vel: 0 },
    ];
    const scaleStates = [
      { v: 1, vel: 0 }, { v: 1, vel: 0 }, { v: 1, vel: 0 }, { v: 1, vel: 0 },
    ];

    delays.forEach((delay, i) => {
      let started = false;
      let phaseDir = "to";
      let lastTs = null;

      const animate = (ts) => {
        if (!started) { started = true; lastTs = ts; }
        const dt = Math.min((ts - (lastTs || ts)) / 1000, 0.05);
        lastTs = ts;

        const tgtX = phaseDir === "to" ? 100 : 0;
        const tgtS = phaseDir === "to" ? 1.12 : 1;

        const [nx, nv]  = springStep(states[i].x,       states[i].vel,     tgtX, config.stiffness, config.damping, dt);
        const [ns, nsv] = springStep(scaleStates[i].v,  scaleStates[i].vel, tgtS, config.stiffness, config.damping, dt);

        states[i]      = { x: nx,  vel: nv  };
        scaleStates[i] = { v: ns,  vel: nsv };

        setPositions(p => { const n=[...p]; n[i]=nx; return n; });
        setScales(p    => { const n=[...p]; n[i]=ns; return n; });

        const done = Math.abs(nx - tgtX) < 0.5 && Math.abs(nv) < 0.5;
        if (done) phaseDir = phaseDir === "to" ? "from" : "to";

        rafRefs.current[i] = requestAnimationFrame(animate);
      };

      const timer = setTimeout(() => {
        rafRefs.current[i] = requestAnimationFrame(animate);
      }, delay);

      return () => { clearTimeout(timer); cancelAnimationFrame(rafRefs.current[i]); };
    });

    return () => rafRefs.current.forEach(r => cancelAnimationFrame(r));
  }, [config.stiffness, config.damping, tick]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {colors.map((color, i) => (
        <div key={i} style={{
          width: 48, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${color}cc, ${color}55)`,
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 12px ${color}33`,
          transform: `translateX(${positions[i]}px) scale(${scales[i]})`,
          willChange: "transform",
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

// ── Hover demo ────────────────────────────────────────────────────────────────
function HoverDemo({ color }) {
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const [y, setY] = useState(0);
  const [shadow, setShadow] = useState(0);
  const rafRef = useRef(null);
  const stateRef = useRef({ scale: 1, scaleV: 0, y: 0, yV: 0 });

  useEffect(() => {
    const tgtScale = hovered ? 1.08 : 1;
    const tgtY = hovered ? -6 : 0;

    const tick = (ts) => {
      const s = stateRef.current;
      const [ns, nsv] = springStep(s.scale, s.scaleV, tgtScale, 400, 25);
      const [ny, nyv] = springStep(s.y, s.yV, tgtY, 400, 25);
      stateRef.current = { scale: ns, scaleV: nsv, y: ny, yV: nyv };
      setScale(ns); setY(ny);
      setShadow(Math.abs(ny) / 6);

      const done = Math.abs(ns - tgtScale) < 0.001 && Math.abs(ny - tgtY) < 0.1;
      if (!done) rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hovered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 140, height: 80, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}44, ${color}22)`,
          border: `1.5px solid ${hovered ? color : color + "66"}`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 4,
          cursor: "pointer",
          transform: `translateY(${y}px) scale(${scale})`,
          boxShadow: `0 ${4 + shadow * 12}px ${12 + shadow * 20}px ${color}${Math.floor(shadow * 60 + 10).toString(16).padStart(2,"0")}`,
          transition: "border-color 0.2s",
          willChange: "transform, box-shadow",
        }}
      >
        <span style={{ fontSize: 18 }}>✦</span>
        <span style={{ fontSize: 10, color: hovered ? color : C.muted, fontFamily: "JetBrains Mono, monospace" }}>
          {hovered ? "hovered!" : "hover me"}
        </span>
      </div>
      <div style={{ fontSize: 10, color: C.muted }}>
        whileHover — spring 400 / 25
      </div>
    </div>
  );
}

// ── Code snippet ──────────────────────────────────────────────────────────────
function CodeSnippet({ type, stiffness, damping, duration, easing, rotate, demo }) {
  const transition = type === "spring"
    ? `    type: "spring",\n    stiffness: ${stiffness},\n    damping: ${damping},`
    : `    duration: ${duration},\n    ease: "${easing}",`;

  const rotateStr = rotate ? ", rotate: 10" : "";

  const codes = {
    basic: `<motion.div
  animate={{ x: 120, scale: 1.1${rotateStr} }}
  transition={{
${transition}
  }}
/>`,
    stagger: `const container = {
  animate: {
    transition: { staggerChildren: 0.12 }
  }
};
const item = {
  hidden:  { x: 0, scale: 1 },
  animate: { x: 100, scale: 1.1 },
};

<motion.div variants={container} animate="animate">
  {items.map(i => (
    <motion.div variants={item}
      transition={{
${transition}
      }}
    />
  ))}
</motion.div>`,
    whileHover: `<motion.div
  whileHover={{ scale: 1.08, y: -6 }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 25,
  }}
/>`,
  };

  const code = codes[demo] || codes.basic;

  const renderLine = (line, i) => {
    const tokens = [];
    let rest = line;

    const push = (text, color) => tokens.push({ text, color });

    // strings
    rest = rest.replace(/"([^"]*)"/g, (m) => {
      push(m, C.green); return "\x00";
    });
    // numbers
    rest = rest.replace(/\b(\d+\.?\d*)\b/g, (m) => {
      push(m, C.orange); return "\x00";
    });
    // jsx tags
    rest = rest.replace(/(<\/?)(\w+\.\w+|\w+)([> /])/g, (m, sl, tag, after) => {
      push(sl + tag, C.purple); push(after, C.muted); return "\x00\x00";
    });
    // prop names
    rest = rest.replace(/\b(animate|transition|variants|initial|exit|whileHover|whileTap|type|stiffness|damping|duration|ease|scale|x|y|rotate|opacity|staggerChildren|delayChildren|hidden)(?=:)/g, (m) => {
      push(m, C.accent); return "\x00";
    });
    // keywords
    rest = rest.replace(/\b(const|return|map)\b/g, (m) => {
      push(m, C.yellow); return "\x00";
    });

    // now split rest by \x00 and interleave with pushed tokens
    const parts = rest.split("\x00");
    let ti = 0;
    return (
      <div key={i}>
        {parts.map((p, j) => (
          <>
            {p && <span style={{ color: C.muted }}>{p}</span>}
            {tokens[ti] && (() => { const t = tokens[ti++]; return <span style={{ color: t.color }}>{t.text}</span>; })()}
          </>
        ))}
      </div>
    );
  };

  return (
    <pre style={{
      background: C.surface2, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "12px 14px", margin: 0,
      fontSize: 11, lineHeight: 1.7,
      fontFamily: "JetBrains Mono, monospace",
      overflowX: "auto", whiteSpace: "pre",
    }}>
      {code.split("\n").map(renderLine)}
    </pre>
  );
}
