import { useState, useRef, useEffect, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89",
  css: "#9ece6a",      // green — CSS wins
  js: "#bb9af7",       // purple — JS wins
  both: "#7dcfff",     // blue — both ok
  warn: "#ff9e64",     // orange — warning
  danger: "#ff5f57",   // red — avoid
  yellow: "#e0af68",
};

// ── Spring physics ────────────────────────────────────────────────────────────
function springStep(pos, vel, target, k = 300, d = 28, dt = 0.016) {
  const f = -k * (pos - target) - d * vel;
  const nv = vel + f * dt;
  return [pos + nv * dt, nv];
}

function useSpring(target, k = 300, d = 28) {
  const s = useRef({ pos: target, vel: 0 });
  const [val, setVal] = useState(target);
  const raf = useRef(null);
  const tRef = useRef(target);
  useEffect(() => { tRef.current = target; }, [target]);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const tick = () => {
      const [np, nv] = springStep(s.current.pos, s.current.vel, tRef.current, k, d);
      s.current = { pos: np, vel: nv };
      setVal(np);
      if (Math.abs(np - tRef.current) > 0.01 || Math.abs(nv) > 0.01)
        raf.current = requestAnimationFrame(tick);
      else setVal(tRef.current);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, k, d]);
  return val;
}

// ── Decision tree data ────────────────────────────────────────────────────────
const TREE = {
  id: "root",
  q: "Is the final state known before the animation starts?",
  yes: {
    id: "known",
    q: "Does it depend on user interaction (hover, focus, click)?",
    yes: {
      id: "interaction",
      q: "Does it need physics (spring, bounce, drag)?",
      yes: {
        id: "physics",
        result: "js",
        label: "JS animation",
        reason: "CSS can't do spring physics. Use Framer Motion or react-spring.",
        examples: ["drag & drop", "spring bounce", "magnetic hover"],
      },
      no: {
        id: "simple-interaction",
        result: "css",
        label: "CSS transition",
        reason: "Simple state changes on interaction are perfect for CSS transitions.",
        examples: ["hover lift", "button press", "focus ring"],
      },
    },
    no: {
      id: "no-interaction",
      q: "Is it a repeating / looping animation?",
      yes: {
        id: "loop",
        result: "css",
        label: "CSS @keyframes",
        reason: "Looping animations with no JS logic are perfect for @keyframes.",
        examples: ["spinner", "pulse", "skeleton shimmer"],
      },
      no: {
        id: "entrance",
        result: "css",
        label: "CSS transition + class",
        reason: "Add a class to trigger the transition. IntersectionObserver for scroll.",
        examples: ["fade in", "slide up on scroll", "card entrance"],
      },
    },
  },
  no: {
    id: "unknown",
    q: "Does it depend on measured DOM size?",
    yes: {
      id: "measured",
      result: "js",
      label: "JS animation",
      reason: "You need JS to measure the element first, then animate to that value.",
      examples: ["accordion height", "auto height", "content-aware resize"],
    },
    no: {
      id: "not-measured",
      q: "Is it driven by data / user input in real time?",
      yes: {
        id: "realtime",
        result: "js",
        label: "JS animation",
        reason: "Real-time data or cursor position requires JS to read and respond.",
        examples: ["cursor follower", "data visualization", "audio visualizer"],
      },
      no: {
        id: "stagger",
        result: "js",
        label: "JS animation",
        reason: "Dynamic item count means you can't hardcode animation-delay in CSS.",
        examples: ["stagger list", "dynamic stagger", "items from API"],
      },
    },
  },
};

// ── Decision Tree UI ──────────────────────────────────────────────────────────
function DecisionTree({ onResult }) {
  const [path, setPath] = useState([]);
  const [node, setNode] = useState(TREE);

  const answer = (yes) => {
    const next = yes ? node.yes : node.no;
    setPath(p => [...p, { q: node.q, ans: yes }]);
    setNode(next);
    if (next.result) onResult(next);
  };

  const reset = () => { setPath([]); setNode(TREE); onResult(null); };

  const resultColor = node.result === "css" ? C.css : node.result === "js" ? C.js : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* path breadcrumb */}
      {path.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
          {path.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 9, color: C.muted, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {step.q.length > 30 ? step.q.slice(0, 28) + "…" : step.q}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                background: step.ans ? C.css + "22" : C.danger + "22",
                color: step.ans ? C.css : C.danger,
                border: `1px solid ${step.ans ? C.css + "44" : C.danger + "44"}`,
              }}>{step.ans ? "yes" : "no"}</span>
              {i < path.length - 1 && <span style={{ color: C.border }}>›</span>}
            </div>
          ))}
        </div>
      )}

      {/* current node */}
      {!node.result ? (
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "16px",
        }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>// question</div>
          <div style={{ fontSize: 13, color: C.text, fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>
            {node.q}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => answer(true)} style={{
              flex: 1, background: C.css + "18", border: `1px solid ${C.css}66`,
              borderRadius: 8, padding: "9px",
              color: C.css, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>✓ yes</button>
            <button onClick={() => answer(false)} style={{
              flex: 1, background: C.danger + "18", border: `1px solid ${C.danger}66`,
              borderRadius: 8, padding: "9px",
              color: C.danger, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>✗ no</button>
          </div>
        </div>
      ) : (
        <div style={{
          background: resultColor + "12",
          border: `1.5px solid ${resultColor}66`,
          borderRadius: 12, padding: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
              background: resultColor + "22", color: resultColor,
              border: `1px solid ${resultColor}55`,
            }}>→ {node.label}</div>
          </div>
          <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6, marginBottom: 10 }}>
            {node.reason}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {node.examples.map((ex, i) => (
              <span key={i} style={{
                fontSize: 9, padding: "2px 8px", borderRadius: 10,
                background: resultColor + "18", color: resultColor,
                border: `1px solid ${resultColor}33`,
              }}>{ex}</span>
            ))}
          </div>
          <button onClick={reset} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 7, padding: "6px 14px",
            color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
          }}>↺ start over</button>
        </div>
      )}
    </div>
  );
}

// ── Live demos ────────────────────────────────────────────────────────────────

// CSS hover demo
function HoverDemo() {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
      {["Button", "Card", "Link"].map((label, i) => (
        <div key={i} style={{
          padding: i === 1 ? "14px 18px" : "8px 18px",
          borderRadius: i === 1 ? 10 : 7,
          background: ["#7dcfff18","#bb9af718","#9ece6a18"][i],
          border: `1px solid ${["#7dcfff44","#bb9af744","#9ece6a44"][i]}`,
          color: [C.accent, C.js, C.css][i],
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = `0 8px 20px ${["#7dcfff","#bb9af7","#9ece6a"][i]}33`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >{label}</div>
      ))}
    </div>
  );
}

// CSS spinner demo
function SpinnerDemo() {
  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "center" }}>
      <style>{`
        @keyframes cssSpin { to { transform: rotate(360deg); } }
        @keyframes cssPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.85)} }
        @keyframes cssPing { 75%,100%{transform:scale(2);opacity:0} }
        .spin { animation: cssSpin 0.8s linear infinite; }
        .pulse { animation: cssPulse 1.4s ease-in-out infinite; }
        .ping-wrap { position:relative; width:16px; height:16px; }
        .ping { animation: cssPing 1.2s cubic-bezier(0,0,0.2,1) infinite; position:absolute; inset:0; border-radius:50%; background:#7dcfff44; }
        .ping-dot { position:absolute; inset:2px; border-radius:50%; background:#7dcfff; }
      `}</style>
      <div className="spin" style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${C.border}`, borderTopColor: C.accent }} />
      <div className="pulse" style={{ width: 12, height: 12, borderRadius: "50%", background: C.css }} />
      <div className="ping-wrap">
        <div className="ping" />
        <div className="ping-dot" />
      </div>
      <div style={{ fontSize: 9, color: C.muted }}>pure CSS @keyframes</div>
    </div>
  );
}

// CSS entrance demo
function EntranceDemo() {
  const [visible, setVisible] = useState(false);
  const items = ["Design", "Develop", "Ship"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <style>{`
        .entrance-item { opacity: 0; transform: translateY(14px); transition: opacity 0.35s ease, transform 0.35s ease; }
        .entrance-item.vis { opacity: 1; transform: translateY(0); }
        .entrance-item:nth-child(2) { transition-delay: 0.08s; }
        .entrance-item:nth-child(3) { transition-delay: 0.16s; }
      `}</style>
      <div style={{ display: "flex", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} className={`entrance-item ${visible ? "vis" : ""}`} style={{
            padding: "8px 14px", borderRadius: 8,
            background: C.css + "18", border: `1px solid ${C.css}44`,
            color: C.css, fontSize: 11, fontWeight: 600,
          }}>{item}</div>
        ))}
      </div>
      <button onClick={() => setVisible(v => !v)} style={{
        background: "transparent", border: `1px solid ${C.border}`,
        borderRadius: 7, padding: "5px 14px",
        color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
      }}>
        {visible ? "↑ hide" : "↓ show"}
      </button>
      <div style={{ fontSize: 9, color: C.muted }}>CSS transition + class toggle</div>
    </div>
  );
}

// JS spring demo
function SpringDemo() {
  const containerRef = useRef(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const x = useSpring(mouseX, 180, 16);
  const y = useSpring(mouseY, 180, 16);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        ref={containerRef}
        onMouseMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          setMouseX(e.clientX - r.left - r.width / 2);
          setMouseY(e.clientY - r.top - r.height / 2);
        }}
        onMouseLeave={() => { setMouseX(0); setMouseY(0); }}
        style={{
          width: "100%", height: 100,
          background: C.surface2, borderRadius: 10,
          border: `1px solid ${C.border}`,
          position: "relative", cursor: "crosshair", overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: 32, height: 32, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.js}cc, ${C.js}66)`,
          boxShadow: `0 0 16px ${C.js}66`,
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          willChange: "transform",
        }} />
        {/* trailing dots */}
        {[0.6, 0.35, 0.15].map((lag, i) => (
          <div key={i} style={{
            position: "absolute",
            left: "50%", top: "50%",
            width: 10 - i * 3, height: 10 - i * 3,
            borderRadius: "50%",
            background: C.js + ["66","44","22"][i],
            transform: `translate(calc(-50% + ${x * lag}px), calc(-50% + ${y * lag}px))`,
            willChange: "transform",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 9, color: C.muted }}>
        spring follows cursor — x: {Math.round(x)}, y: {Math.round(y)}
      </div>
    </div>
  );
}

// JS stagger demo
const STAGGER_ITEMS = ["fetchData()", "parseJSON()", "validate()", "render()", "cache()"];
function StaggerDemo() {
  const [visible, setVisible] = useState(false);
  const [vals, setVals] = useState(STAGGER_ITEMS.map(() => ({ opacity: 0, x: -20 })));
  const rafRefs = useRef([]);

  const animate = useCallback((show) => {
    STAGGER_ITEMS.forEach((_, i) => {
      cancelAnimationFrame(rafRefs.current[i]);
      const delay = i * 90;
      const timer = setTimeout(() => {
        const tgt = show ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 };
        const state = { opacity: vals[i].opacity, x: vals[i].x, vOp: 0, vX: 0 };
        const tick = () => {
          const [nOp, nvOp] = springStep(state.opacity, state.vOp, tgt.opacity, 300, 28);
          const [nX, nvX] = springStep(state.x, state.vX, tgt.x, 300, 28);
          state.opacity = nOp; state.vOp = nvOp;
          state.x = nX; state.vX = nvX;
          setVals(prev => {
            const n = [...prev];
            n[i] = { opacity: nOp, x: nX };
            return n;
          });
          const done = Math.abs(nOp - tgt.opacity) < 0.01 && Math.abs(nX - tgt.x) < 0.1;
          if (!done) rafRefs.current[i] = requestAnimationFrame(tick);
        };
        rafRefs.current[i] = requestAnimationFrame(tick);
      }, delay);
      rafRefs.current[`t${i}`] = timer;
    });
  }, []);

  const toggle = () => {
    const next = !visible;
    setVisible(next);
    animate(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 5 }}>
        {STAGGER_ITEMS.map((item, i) => (
          <div key={i} style={{
            padding: "6px 12px", borderRadius: 7,
            background: C.js + "18", border: `1px solid ${C.js}33`,
            color: C.js, fontSize: 11, fontFamily: "JetBrains Mono, monospace",
            opacity: vals[i].opacity,
            transform: `translateX(${vals[i].x}px)`,
            willChange: "transform, opacity",
          }}>{item}</div>
        ))}
      </div>
      <button onClick={toggle} style={{
        background: "transparent", border: `1px solid ${C.border}`,
        borderRadius: 7, padding: "5px 14px",
        color: C.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
      }}>{visible ? "↑ hide" : "↓ stagger in"}</button>
      <div style={{ fontSize: 9, color: C.muted }}>JS stagger — delay = index × 90ms</div>
    </div>
  );
}

// ── Performance table ─────────────────────────────────────────────────────────
const PROPS = [
  { prop: "transform", trigger: "none", gpu: true,  note: "compositor only" },
  { prop: "opacity",   trigger: "none", gpu: true,  note: "compositor only" },
  { prop: "filter",    trigger: "paint",gpu: true,  note: "GPU but repaint" },
  { prop: "width",     trigger: "layout",gpu: false, note: "full recalc ⚠" },
  { prop: "height",    trigger: "layout",gpu: false, note: "full recalc ⚠" },
  { prop: "top/left",  trigger: "layout",gpu: false, note: "use translate!" },
  { prop: "color",     trigger: "paint", gpu: false, note: "repaint only" },
  { prop: "background",trigger: "paint", gpu: false, note: "repaint only" },
];

function PerfTable() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["property", "triggers", "GPU", "note"].map(h => (
              <th key={h} style={{ padding: "6px 10px", color: C.muted, fontWeight: 700, textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROPS.map((p, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
              <td style={{ padding: "6px 10px", color: p.gpu ? C.css : p.trigger === "layout" ? C.danger : C.warn, fontWeight: 600 }}>{p.prop}</td>
              <td style={{ padding: "6px 10px", color: p.trigger === "none" ? C.css : p.trigger === "layout" ? C.danger : C.warn }}>
                {p.trigger === "none" ? "✓ none" : p.trigger === "layout" ? "✗ layout" : "△ paint"}
              </td>
              <td style={{ padding: "6px 10px", color: p.gpu ? C.css : C.muted }}>{p.gpu ? "✓" : "✗"}</td>
              <td style={{ padding: "6px 10px", color: C.muted }}>{p.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const DEMOS = [
  { key: "hover",    label: "hover",    color: C.css,  tag: "CSS", desc: "transition" },
  { key: "spinner",  label: "spinner",  color: C.css,  tag: "CSS", desc: "@keyframes" },
  { key: "entrance", label: "entrance", color: C.css,  tag: "CSS", desc: "class toggle" },
  { key: "spring",   label: "spring",   color: C.js,   tag: "JS",  desc: "cursor follow" },
  { key: "stagger",  label: "stagger",  color: C.js,   tag: "JS",  desc: "dynamic delay" },
];

export default function CSSvsJSDemo() {
  const [activeDemo, setActiveDemo] = useState("hover");
  const [treeResult, setTreeResult] = useState(null);
  const [tab, setTab] = useState("tree"); // tree | demos | perf

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "24px 16px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <style>{`
        button:hover { opacity: 0.85; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
            // animation strategy
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            <span style={{ color: C.css }}>CSS</span>
            <span style={{ color: C.muted, margin: "0 10px", fontSize: 16 }}>vs</span>
            <span style={{ color: C.js }}>JS</span>
            <span style={{ color: C.text }}> animations</span>
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>
            decision tree · live demos · performance guide
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[
            { key: "tree",  label: "// decision tree" },
            { key: "demos", label: "// live demos"     },
            { key: "perf",  label: "// performance"    },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1,
              background: tab === t.key ? C.surface : "transparent",
              border: `1px solid ${tab === t.key ? C.accent + "55" : C.border}`,
              borderRadius: 8, padding: "8px 6px",
              color: tab === t.key ? C.accent : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── DECISION TREE ── */}
        {tab === "tree" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <DecisionTree onResult={setTreeResult} />

            {/* quick cheat sheet */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// quick reference</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ color: C.css, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>CSS ✓</div>
                  {["hover / focus / active", "loading spinners", "entrance + scroll", "skeleton shimmer", "simple toggles"].map((item, i) => (
                    <div key={i} style={{ fontSize: 10, color: C.muted, padding: "2px 0", display: "flex", gap: 6 }}>
                      <span style={{ color: C.css }}>›</span>{item}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ color: C.js, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>JS ✓</div>
                  {["spring / physics", "drag & drop", "cursor follower", "dynamic stagger", "interrupt & redirect"].map((item, i) => (
                    <div key={i} style={{ fontSize: 10, color: C.muted, padding: "2px 0", display: "flex", gap: 6 }}>
                      <span style={{ color: C.js }}>›</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE DEMOS ── */}
        {tab === "demos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* demo selector */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DEMOS.map(d => (
                <button key={d.key} onClick={() => setActiveDemo(d.key)} style={{
                  background: activeDemo === d.key ? d.color + "22" : C.surface,
                  border: `1px solid ${activeDemo === d.key ? d.color : C.border}`,
                  borderRadius: 8, padding: "6px 12px",
                  color: activeDemo === d.key ? d.color : C.muted,
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <span style={{
                      fontSize: 8, padding: "1px 5px", borderRadius: 4,
                      background: d.color + "22", color: d.color,
                      border: `1px solid ${d.color}44`,
                    }}>{d.tag}</span>
                    <span>{d.label}</span>
                  </div>
                  <span style={{ fontSize: 9, opacity: 0.65 }}>{d.desc}</span>
                </button>
              ))}
            </div>

            {/* demo area */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "24px 20px", minHeight: 160,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              {/* grid bg */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.25,
                backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 31px,${C.border} 31px,${C.border} 32px),repeating-linear-gradient(90deg,transparent,transparent 31px,${C.border} 31px,${C.border} 32px)`,
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative", width: "100%" }}>
                {activeDemo === "hover"    && <HoverDemo />}
                {activeDemo === "spinner"  && <SpinnerDemo />}
                {activeDemo === "entrance" && <EntranceDemo />}
                {activeDemo === "spring"   && <SpringDemo />}
                {activeDemo === "stagger"  && <StaggerDemo />}
              </div>
            </div>

            {/* which tool */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10, fontSize: 10,
            }}>
              <div style={{
                padding: "3px 10px", borderRadius: 6, fontWeight: 700,
                background: DEMOS.find(d => d.key === activeDemo)?.color + "22",
                color: DEMOS.find(d => d.key === activeDemo)?.color,
                border: `1px solid ${DEMOS.find(d => d.key === activeDemo)?.color}44`,
              }}>
                {DEMOS.find(d => d.key === activeDemo)?.tag}
              </div>
              <span style={{ color: C.muted }}>{DEMOS.find(d => d.key === activeDemo)?.desc}</span>
              <span style={{ color: C.border }}>·</span>
              <span style={{ color: C.muted }}>
                {activeDemo === "hover"    && "transition property handles the rest"}
                {activeDemo === "spinner"  && "@keyframes loops forever, zero JS"}
                {activeDemo === "entrance" && "add .visible class → CSS does the rest"}
                {activeDemo === "spring"   && "cursor position unknown until runtime"}
                {activeDemo === "stagger"  && "item count dynamic → delay calculated in JS"}
              </span>
            </div>
          </div>
        )}

        {/* ── PERFORMANCE ── */}
        {tab === "perf" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "16px",
            }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>
                // CSS properties → what they trigger
              </div>
              <PerfTable />
            </div>

            {/* the golden rule */}
            <div style={{
              background: C.css + "10", border: `1px solid ${C.css}44`,
              borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ color: C.css, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                // the golden rule
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>
                Animate only <span style={{ color: C.css }}>transform</span> and <span style={{ color: C.css }}>opacity</span>.
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 4 }}>
                Both run on the compositor thread — completely separate from JS and layout.
                Even if your JS is busy, these animations stay at 60fps.
              </div>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
            }}>
              <div style={{ background: C.danger + "10", border: `1px solid ${C.danger}44`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ color: C.danger, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>✗ avoid animating</div>
                {["width / height", "top / left / right", "margin / padding", "font-size", "display / visibility"].map((p, i) => (
                  <div key={i} style={{ fontSize: 10, color: C.muted, padding: "2px 0" }}>
                    <span style={{ color: C.danger, marginRight: 6 }}>›</span>{p}
                  </div>
                ))}
              </div>
              <div style={{ background: C.css + "10", border: `1px solid ${C.css}44`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ color: C.css, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>✓ safe to animate</div>
                {["transform: translate", "transform: scale", "transform: rotate", "opacity", "filter (carefully)"].map((p, i) => (
                  <div key={i} style={{ fontSize: 10, color: C.muted, padding: "2px 0" }}>
                    <span style={{ color: C.css, marginRight: 6 }}>›</span>{p}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "12px 14px",
              fontSize: 10, color: C.muted, lineHeight: 1.8,
            }}>
              <span style={{ color: C.yellow }}>will-change: transform</span>
              {" — hints browser to create a compositor layer upfront. Helps for complex animations, but each layer costs GPU memory. Use only when needed, not on everything."}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
