import { useState, useCallback, useEffect, useRef } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", teal: "#1abc9c",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

const SHAPES = [
  {
    name: "triangle", color: C.purple, points: 3,
    clip:    "polygon(50% 0%, 0% 100%, 100% 100%)",
    hover:   "polygon(50% 8%, 3% 97%, 97% 97%)",
    explode: "polygon(50% 20%, 15% 80%, 85% 80%)",
  },
  {
    name: "hexagon", color: C.accent, points: 6,
    clip:    "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    hover:   "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
    explode: "polygon(30% 5%, 70% 5%, 98% 45%, 70% 95%, 30% 95%, 2% 45%)",
  },
  {
    name: "arrow", color: C.green, points: 7,
    clip:    "polygon(0 15%, 70% 15%, 70% 0%, 100% 50%, 70% 100%, 70% 85%, 0 85%)",
    hover:   "polygon(0 18%, 68% 18%, 68% 0%, 100% 50%, 68% 100%, 68% 82%, 0 82%)",
    explode: "polygon(5% 20%, 60% 20%, 60% 5%, 95% 50%, 60% 95%, 60% 80%, 5% 80%)",
  },
  {
    name: "diagonal", color: C.orange, points: 4,
    clip:    "polygon(0 0, 100% 0, 100% 80%, 0 100%)",
    hover:   "polygon(0 0, 100% 0, 100% 72%, 0 100%)",
    explode: "polygon(5% 5%, 95% 5%, 95% 75%, 5% 95%)",
  },
  {
    name: "star", color: C.yellow, points: 10,
    clip:    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    hover:   "polygon(50% 3%, 60% 33%, 95% 33%, 67% 54%, 76% 88%, 50% 68%, 24% 88%, 33% 54%, 5% 33%, 40% 33%)",
    explode: "polygon(50% 10%, 58% 38%, 90% 38%, 65% 56%, 74% 85%, 50% 67%, 26% 85%, 35% 56%, 10% 38%, 42% 38%)",
  },
  {
    name: "circle", color: C.teal, points: null,
    clip:    "circle(50% at 50% 50%)",
    hover:   "circle(46% at 50% 50%)",
    explode: "circle(38% at 50% 50%)",
  },
  {
    name: "inset", color: C.purple, points: null,
    clip:    "inset(8px round 18px)",
    hover:   "inset(4px round 8px)",
    explode: "inset(22px round 34px)",
  },
  {
    name: "ellipse", color: C.accent, points: null,
    clip:    "ellipse(50% 35% at 50% 50%)",
    hover:   "ellipse(46% 40% at 50% 50%)",
    explode: "ellipse(36% 28% at 50% 50%)",
  },
  {
    name: "parallelogram", color: C.orange, points: 4,
    clip:    "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
    hover:   "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
    explode: "polygon(20% 5%, 95% 5%, 80% 95%, 5% 95%)",
  },
];

const ANIM_DEMOS = [
  { label: "reveal left", from: "polygon(0 0, 0 0, 0 100%, 0 100%)",  to: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", color: C.accent },
  { label: "reveal top",  from: "polygon(0 0, 100% 0, 100% 0, 0 0)",  to: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", color: C.green },
  { label: "iris in",     from: "circle(0% at 50% 50%)",               to: "circle(75% at 50% 50%)",                   color: C.purple },
  { label: "wipe center", from: "inset(0 50% 0 50%)",                  to: "inset(0 0% 0 0%)",                         color: C.yellow },
];

const SPRING = "0.55s cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASE   = "0.4s ease";

function getWarn(idx) {
  const s = SHAPES[idx];
  if (!s.points) return null;
  const prev = SHAPES[(idx + SHAPES.length - 1) % SHAPES.length];
  const next = SHAPES[(idx + 1) % SHAPES.length];
  const msgs = [];
  if (prev.points && prev.points !== s.points)
    msgs.push(`← ${prev.name} (${prev.points}pt) → ${s.name} (${s.points}pt): різна кількість → різкий стрибок`);
  if (next.points && next.points !== s.points)
    msgs.push(`${s.name} (${s.points}pt) → ${next.name} (${next.points}pt): різна кількість → різкий стрибок`);
  return msgs.length ? msgs : null;
}

// ── PreviewBox: morph on shape change + squeeze→burst→settle on click ─────────
function PreviewBox({ idx, springMode, hoverMode }) {
  // morph state: which shape is currently displayed
  const [displayIdx, setDisplayIdx] = useState(idx);
  const [morphPhase, setMorphPhase] = useState("idle"); // idle | out | in
  // click animation
  const [clickPhase, setClickPhase] = useState("idle"); // idle | squeeze | burst | settle
  const [toggled, setToggled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const morphTimer = useRef(null);
  const clickTimer = useRef(null);
  const prevIdx = useRef(idx);

  // ── morph when idx changes ──
  useEffect(() => {
    if (idx === prevIdx.current) return;
    prevIdx.current = idx;
    clearTimeout(morphTimer.current);

    setMorphPhase("out");
    morphTimer.current = setTimeout(() => {
      setDisplayIdx(idx);
      setToggled(false);
      setMorphPhase("in");
      morphTimer.current = setTimeout(() => setMorphPhase("idle"), 520);
    }, 200);
  }, [idx]);

  const shape = SHAPES[displayIdx];
  const hoverActive = hoverMode && (isHovered || toggled);

  // ── click animation ──
  const handleClick = () => {
    if (morphPhase !== "idle") return;
    clearTimeout(clickTimer.current);
    setClickPhase("squeeze");
    clickTimer.current = setTimeout(() => {
      setClickPhase("burst");
      clickTimer.current = setTimeout(() => {
        setToggled(v => !v);
        setClickPhase("settle");
        clickTimer.current = setTimeout(() => setClickPhase("idle"), 480);
      }, 110);
    }, 90);
  };

  // ── derive final visual state ──
  let clipPath, transform, opacity, transition, filter;

  if (morphPhase === "out") {
    clipPath  = shape.explode;
    transform = "scale(0.65) rotate(-8deg)";
    opacity   = 0;
    filter    = "brightness(1.6)";
    transition = "clip-path 0.2s ease-in, transform 0.2s ease-in, opacity 0.2s ease-in, filter 0.2s ease-in";
  } else if (morphPhase === "in") {
    clipPath  = shape.clip;
    transform = "scale(1.05) rotate(0deg)";
    opacity   = 1;
    filter    = "brightness(1)";
    transition = "clip-path 0.45s cubic-bezier(0.34,1.56,0.64,1), transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease-out, filter 0.3s ease";
  } else if (clickPhase === "squeeze") {
    clipPath  = shape.explode;
    transform = "scale(0.82)";
    opacity   = 1;
    filter    = "brightness(1.3)";
    transition = "clip-path 0.09s ease-in, transform 0.09s ease-in, filter 0.09s ease-in";
  } else if (clickPhase === "burst") {
    clipPath  = hoverActive ? shape.hover : shape.clip;
    transform = "scale(1.12)";
    opacity   = 1;
    filter    = "brightness(1.5)";
    transition = "clip-path 0.11s cubic-bezier(0.22,0.61,0.36,1), transform 0.11s cubic-bezier(0.22,0.61,0.36,1), filter 0.11s ease";
  } else if (clickPhase === "settle") {
    clipPath  = hoverActive ? shape.hover : shape.clip;
    transform = "scale(1)";
    opacity   = 1;
    filter    = "brightness(1)";
    transition = `clip-path ${springMode ? SPRING : EASE}, transform 0.38s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s ease`;
  } else {
    // idle
    clipPath  = hoverActive ? shape.hover : shape.clip;
    transform = isHovered ? "scale(1.04)" : "scale(1)";
    opacity   = 1;
    filter    = isHovered ? "brightness(1.15)" : "brightness(1)";
    transition = `clip-path ${springMode ? SPRING : EASE}, transform 0.3s ease, filter 0.2s ease`;
  }

  const statusText = morphPhase !== "idle" ? "morphing..."
    : clickPhase !== "idle" ? "animating..."
    : isHovered ? "hovering"
    : toggled ? "toggled"
    : "click me";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* ring */}
      <div style={{ position: "relative", width: 176, height: 176, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `${shape.color}10`,
          boxShadow: `0 0 0 1px ${shape.color}20`,
          transition: "background 0.4s, box-shadow 0.4s",
        }} />
        <div
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: 148, height: 148,
            background: shape.color,
            clipPath, transform, opacity, filter, transition,
            cursor: "pointer", userSelect: "none", zIndex: 1,
          }}
        />
      </div>
      <div style={{ fontSize: 10, color: C.muted, minHeight: 16 }}>{statusText}</div>
    </div>
  );
}

// ── ShapeThumb ─────────────────────────────────────────────────────────────────
function ShapeThumb({ shape, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: active ? `${C.accent}18` : hov ? `${C.accent}08` : C.surface,
        border: `1px solid ${active ? `${C.accent}88` : hov ? `${C.accent}33` : C.border}`,
        borderRadius: 8, padding: "9px 5px",
        cursor: "pointer", textAlign: "center",
        color: active ? C.accent : hov ? `${C.accent}aa` : C.muted,
        fontSize: 10, fontFamily: "inherit", transition: "all 0.15s",
        minWidth: 0,
      }}
    >
      <div style={{
        width: 34, height: 34, background: shape.color,
        margin: "0 auto 5px",
        clipPath: hov ? shape.hover : shape.clip,
        transition: "clip-path 0.38s cubic-bezier(0.34,1.56,0.64,1)",
      }} />
      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {shape.name}
      </div>
    </button>
  );
}

function ToggleBtn({ label, on, onClick, color = C.purple }) {
  return (
    <button onClick={onClick} style={{
      background: on ? `${color}22` : "transparent",
      border: `1px solid ${on ? `${color}88` : C.border}`,
      borderRadius: 6, padding: "6px 12px",
      color: on ? color : C.muted,
      fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
    }}>{label}</button>
  );
}

function AnimDemo({ demo, active, onClick }) {
  return (
    <div style={{ textAlign: "center", cursor: "pointer" }} onClick={onClick}>
      <div style={{
        width: 54, height: 54, background: demo.color, margin: "0 auto 5px",
        clipPath: active ? demo.to : demo.from,
        transition: "clip-path 0.6s ease",
      }} />
      <div style={{ fontSize: 10, color: C.muted }}>{demo.label}</div>
    </div>
  );
}

function CodeHighlight({ shape, hoverMode, springMode, onCopy, copied }) {
  const transition = springMode ? SPRING : EASE;
  const renderClip = (clip) => {
    if (clip.startsWith("polygon")) {
      const pts = clip.replace("polygon(", "").replace(/\)$/, "").split(",");
      return (
        <span>
          <span style={{ color: C.accent }}>polygon(</span>
          {pts.map((p, i) => (
            <span key={i}>{"\n  "}<span style={{ color: C.green }}>{p.trim()}</span>{i < pts.length - 1 ? "," : ""}</span>
          ))}
          {"\n"}<span style={{ color: C.accent }}>)</span>
        </span>
      );
    }
    const m = clip.match(/^(\w+)\((.+)\)$/);
    if (m) return <span><span style={{ color: C.accent }}>{m[1]}(</span><span style={{ color: C.green }}>{m[2]}</span><span style={{ color: C.accent }}>)</span></span>;
    return <span style={{ color: C.green }}>{clip}</span>;
  };

  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", fontSize: 11, lineHeight: 1.9, position: "relative", fontFamily: "'JetBrains Mono','Fira Code',monospace", overflowX: "auto" }}>
      <button onClick={onCopy} style={{
        position: "absolute", top: 10, right: 10,
        background: copied ? `${C.green}22` : C.surface,
        border: `1px solid ${copied ? `${C.green}55` : C.border}`,
        borderRadius: 5, padding: "3px 9px",
        color: copied ? C.green : C.muted,
        fontSize: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
      }}>{copied ? "copied!" : "copy"}</button>

      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
        <span style={{ color: C.purple }}>clip-path</span>{": "}{renderClip(shape.clip)}{";"}
        {"\n"}<span style={{ color: C.purple }}>transition</span>{": clip-path "}<span style={{ color: C.green }}>{transition}</span>{";"}
        {hoverMode && <>
          {"\n\n"}<span style={{ color: C.muted }}>{"/* hover */"}</span>
          {"\n"}<span style={{ color: C.accent }}>.element</span><span style={{ color: C.purple }}>:hover</span>{" {\n  "}
          <span style={{ color: C.purple }}>clip-path</span>{": "}<span style={{ color: C.green }}>{shape.hover}</span>{";\n}"}
        </>}
      </pre>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [idx, setIdx] = useState(0);
  const [spring, setSpring] = useState(true);
  const [hoverMode, setHoverMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [animStates, setAnimStates] = useState([false, false, false, false]);

  const shape = SHAPES[idx];
  const warn = getWarn(idx);

  const morphTo = (dir) => setIdx(i => (i + (dir === "next" ? 1 : SHAPES.length - 1)) % SHAPES.length);

  const handleCopy = useCallback(() => {
    const t = spring ? SPRING : EASE;
    const text = `clip-path: ${shape.clip};\ntransition: clip-path ${t};${hoverMode ? `\n\n/* hover */\n.element:hover {\n  clip-path: ${shape.hover};\n}` : ""}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [shape, hoverMode, spring]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'JetBrains Mono','Fira Code',monospace", padding: "20px 18px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: C.accent }}>clip-path</h1>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>CSS shapes playground ✂️</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 195px) minmax(0, 1fr)", gap: 14, alignItems: "start" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>

            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 7 }}>// форма</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 5 }}>
                {SHAPES.map((s, i) => (
                  <ShapeThumb key={s.name} shape={s} active={i === idx} onClick={() => setIdx(i)} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 7 }}>// анімація</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <ToggleBtn label="spring" on={spring} onClick={() => setSpring(v => !v)} color={C.purple} />
                <ToggleBtn label="hover" on={hoverMode} onClick={() => setHoverMode(v => !v)} color={C.green} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 7 }}>// reveal</div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {ANIM_DEMOS.map((a, i) => (
                    <AnimDemo key={a.label} demo={a} active={animStates[i]}
                      onClick={() => setAnimStates(p => p.map((v, j) => j === i ? !v : v))} />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: C.surface2, borderBottom: `1px solid ${C.border}`, padding: "9px 14px", display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {[C.red, C.yellow, C.green].map((c, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />)}
                </div>
                <span style={{ marginLeft: 3, color: C.muted }}>preview</span>
                <span style={{ marginLeft: "auto", color: C.accent }}>{shape.name}</span>
                {shape.points && <span style={{ color: C.muted }}>{shape.points}pt</span>}
              </div>

              <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <PreviewBox idx={idx} springMode={spring} hoverMode={hoverMode} />
                <div style={{ display: "flex", gap: 6 }}>
                  {["← prev", "next →"].map((label, i) => (
                    <button key={label} onClick={() => morphTo(i === 0 ? "prev" : "next")} style={{
                      background: "transparent", border: `1px solid ${C.border}`,
                      borderRadius: 6, padding: "5px 13px",
                      color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    }}>{label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: C.muted }}>// css output</div>
            <CodeHighlight shape={shape} hoverMode={hoverMode} springMode={spring} onCopy={handleCopy} copied={copied} />

            {warn && (
              <div style={{ background: `${C.orange}12`, border: `1px solid ${C.orange}30`, borderRadius: 6, padding: "9px 12px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: C.orange, fontSize: 12, flexShrink: 0 }}>!</span>
                <div style={{ fontSize: 10, color: C.orange, lineHeight: 1.8, minWidth: 0, wordBreak: "break-word" }}>
                  {warn.map((w, i) => <div key={i}>{w}</div>)}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <style>{`* { scrollbar-width: thin; scrollbar-color: ${C.border} transparent; box-sizing: border-box; }`}</style>
    </div>
  );
}
