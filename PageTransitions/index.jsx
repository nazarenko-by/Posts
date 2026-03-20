import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", red: "#ff5f57",
};

// ── Pages content ─────────────────────────────────────────────────────────────
const PAGES = [
  {
    key: "home",
    label: "Home",
    icon: "⌂",
    color: C.accent,
    content: {
      title: "Welcome",
      subtitle: "Start exploring the app",
      body: "This is the home page. Navigate to other sections using the tabs above.",
      items: ["Dashboard", "Analytics", "Settings"],
    },
  },
  {
    key: "work",
    label: "Work",
    icon: "◈",
    color: C.purple,
    content: {
      title: "Projects",
      subtitle: "Your recent work",
      body: "All your projects in one place. Track progress and collaborate with your team.",
      items: ["Design System", "Mobile App", "API Integration"],
    },
  },
  {
    key: "about",
    label: "About",
    icon: "◉",
    color: C.green,
    content: {
      title: "About Us",
      subtitle: "Our story",
      body: "We build tools that help developers ship faster. Founded in 2022.",
      items: ["Team", "Mission", "Blog"],
    },
  },
  {
    key: "contact",
    label: "Contact",
    icon: "◎",
    color: C.orange,
    content: {
      title: "Get in Touch",
      subtitle: "We'd love to hear from you",
      body: "Reach out for partnerships, support, or just to say hello.",
      items: ["Email", "Twitter", "Discord"],
    },
  },
];

// ── Transition variants ───────────────────────────────────────────────────────
const TRANSITIONS = {
  fade: {
    label: "fade",
    desc: "opacity 0→1",
    color: C.accent,
    initial: (dir) => ({ opacity: 0 }),
    animate:       () => ({ opacity: 1 }),
    exit:   (dir) => ({ opacity: 0 }),
    duration: 0.22,
    ease: "easeInOut",
  },
  slide: {
    label: "slide",
    desc: "x: ±100%",
    color: C.purple,
    initial: (dir) => ({ opacity: 0, x: dir > 0 ? "100%" : "-100%" }),
    animate:       () => ({ opacity: 1, x: "0%" }),
    exit:   (dir) => ({ opacity: 0, x: dir > 0 ? "-100%" : "100%" }),
    duration: 0.28,
    ease: "easeInOut",
  },
  scale: {
    label: "scale",
    desc: "scale 0.92→1",
    color: C.green,
    initial: (dir) => ({ opacity: 0, scale: 0.92 }),
    animate:       () => ({ opacity: 1, scale: 1 }),
    exit:   (dir) => ({ opacity: 0, scale: 1.06 }),
    duration: 0.25,
    ease: "easeOut",
  },
  slideUp: {
    label: "slide up",
    desc: "y: 40px→0",
    color: C.orange,
    initial: (dir) => ({ opacity: 0, y: dir > 0 ? 40 : -40 }),
    animate:       () => ({ opacity: 1, y: 0 }),
    exit:   (dir) => ({ opacity: 0, y: dir > 0 ? -40 : 40 }),
    duration: 0.26,
    ease: "easeInOut",
  },
  flip: {
    label: "flip",
    desc: "rotateY 90°",
    color: C.yellow,
    initial: (dir) => ({ opacity: 0, rotateY: dir > 0 ? 90 : -90, scale: 0.9 }),
    animate:       () => ({ opacity: 1, rotateY: 0, scale: 1 }),
    exit:   (dir) => ({ opacity: 0, rotateY: dir > 0 ? -90 : 90, scale: 0.9 }),
    duration: 0.3,
    ease: "easeInOut",
  },
};

// ── Physics-based animation hook ──────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }

function easeInOut(t) { return t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }
function easeOut(t)   { return 1 - Math.pow(1-t, 3); }

const EASEFNS = { easeInOut, easeOut };

// animates a set of CSS props from → to over duration
function usePageTransition(transitionKey, pageKey, direction) {
  const [style, setStyle] = useState({ opacity: 1, x: "0%", y: 0, scale: 1, rotateY: 0 });
  const [phase, setPhase] = useState("idle"); // idle | enter | exit
  const rafRef  = useRef(null);
  const prevKey = useRef(pageKey);

  const trans = TRANSITIONS[transitionKey];

  const animate = useCallback((fromProps, toProps, dur, easeName, onDone) => {
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const easeFn = EASEFNS[easeName] || easeOut;

    const tick = (ts) => {
      const t = Math.min((ts - start) / (dur * 1000), 1);
      const p = easeFn(t);

      const current = {};
      for (const k of Object.keys(toProps)) {
        const f = fromProps[k] ?? toProps[k];
        const tv = toProps[k];
        if (typeof tv === "number" && typeof f === "number") {
          current[k] = lerp(f, tv, p);
        } else {
          current[k] = p > 0.5 ? tv : f;
        }
      }
      setStyle(s => ({ ...s, ...current }));

      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else onDone?.();
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  return { style, animate, trans, rafRef };
}

// ── Page component ────────────────────────────────────────────────────────────
function PageContent({ page }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* hero */}
      <div style={{
        background: `linear-gradient(135deg, ${page.color}18, ${page.color}08)`,
        borderBottom: `1px solid ${page.color}33`,
        padding: "20px 20px 16px",
      }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>{page.icon}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{page.content.title}</div>
        <div style={{ fontSize: 11, color: page.color, marginTop: 2 }}>{page.content.subtitle}</div>
      </div>

      {/* body */}
      <div style={{ padding: "14px 20px", flex: 1 }}>
        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>
          {page.content.body}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {page.content.items.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "8px 12px",
              fontSize: 11, color: C.text,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: page.color, flexShrink: 0,
              }} />
              {item}
              <div style={{ marginLeft: "auto", color: C.muted, fontSize: 10 }}>→</div>
            </div>
          ))}
        </div>
      </div>

      {/* url bar at bottom */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: "6px 12px",
        fontSize: 9, color: C.muted,
        fontFamily: "JetBrains Mono, monospace",
      }}>
        /{PAGES.find(p => p.color === page.color)?.key || ""}
      </div>
    </div>
  );
}

// ── Animated page wrapper ─────────────────────────────────────────────────────
function AnimatedPage({ page, transKey, direction, onReady }) {
  const [vals, setVals] = useState(() => {
    const trans = TRANSITIONS[transKey];
    const init = trans.initial(direction);
    return {
      opacity: init.opacity ?? 1,
      x: init.x ?? "0%",
      y: init.y ?? 0,
      scale: init.scale ?? 1,
      rotateY: init.rotateY ?? 0,
    };
  });
  const rafRef = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    const trans = TRANSITIONS[transKey];
    const init = trans.initial(direction);
    const target = trans.animate(direction);
    const dur = trans.duration * 1000;
    const easeFn = EASEFNS[trans.ease] || easeOut;
    const start = performance.now();

    const from = {
      opacity: init.opacity ?? 1,
      x: typeof init.x === "string" ? (init.x === "100%" ? 1 : init.x === "-100%" ? -1 : 0) : (init.x ?? 0),
      y: init.y ?? 0,
      scale: init.scale ?? 1,
      rotateY: init.rotateY ?? 0,
    };
    const to = {
      opacity: target.opacity ?? 1,
      x: 0,
      y: target.y ?? 0,
      scale: target.scale ?? 1,
      rotateY: target.rotateY ?? 0,
    };

    const tick = (ts) => {
      const t = Math.min((ts - start) / dur, 1);
      const p = easeFn(t);

      const xVal = init.x === "100%" ? `${lerp(100, 0, p)}%`
        : init.x === "-100%" ? `${lerp(-100, 0, p)}%`
        : `0%`;

      setVals({
        opacity: lerp(from.opacity, to.opacity, p),
        x: xVal,
        y: lerp(from.y, to.y, p),
        scale: lerp(from.scale, to.scale, p),
        rotateY: lerp(from.rotateY, to.rotateY, p),
      });

      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else onReady?.();
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const transform = [
    `translateX(${vals.x})`,
    `translateY(${vals.y}px)`,
    `scale(${vals.scale})`,
    `perspective(600px) rotateY(${vals.rotateY}deg)`,
  ].join(" ");

  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: vals.opacity,
      transform,
      willChange: "transform, opacity",
    }}>
      <PageContent page={page} />
    </div>
  );
}

// ── ExitingPage ───────────────────────────────────────────────────────────────
function ExitingPage({ page, transKey, direction, onDone }) {
  const [vals, setVals] = useState({ opacity: 1, x: "0%", y: 0, scale: 1, rotateY: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const trans = TRANSITIONS[transKey];
    const exitTarget = trans.exit(direction);
    const dur = trans.duration * 1000;
    const easeFn = EASEFNS[trans.ease] || easeOut;
    const start = performance.now();

    const to = {
      opacity: exitTarget.opacity ?? 0,
      xPct: exitTarget.x === "-100%" ? -100 : exitTarget.x === "100%" ? 100 : 0,
      y: exitTarget.y ?? 0,
      scale: exitTarget.scale ?? 1,
      rotateY: exitTarget.rotateY ?? 0,
    };

    const tick = (ts) => {
      const t = Math.min((ts - start) / dur, 1);
      const p = easeFn(t);

      setVals({
        opacity: lerp(1, to.opacity, p),
        x: `${lerp(0, to.xPct, p)}%`,
        y: lerp(0, to.y, p),
        scale: lerp(1, to.scale, p),
        rotateY: lerp(0, to.rotateY, p),
      });

      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else onDone?.();
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const transform = [
    `translateX(${vals.x})`,
    `translateY(${vals.y}px)`,
    `scale(${vals.scale})`,
    `perspective(600px) rotateY(${vals.rotateY}deg)`,
  ].join(" ");

  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: vals.opacity,
      transform,
      willChange: "transform, opacity",
    }}>
      <PageContent page={page} />
    </div>
  );
}

// ── Mini browser ──────────────────────────────────────────────────────────────
function MiniBrowser({ currentPage, prevPage, transKey, direction, transitioning, onTransitionEnd }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
    }}>
      {/* browser chrome */}
      <div style={{
        background: C.surface2,
        borderBottom: `1px solid ${C.border}`,
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {/* traffic lights */}
        <div style={{ display: "flex", gap: 5 }}>
          {[C.red, C.yellow, C.green].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c + "cc" }} />
          ))}
        </div>

        {/* url bar */}
        <div style={{
          flex: 1, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 6, padding: "4px 10px",
          fontSize: 10, color: C.muted, fontFamily: "JetBrains Mono, monospace",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ color: C.green, fontSize: 9 }}>🔒</span>
          <span>localhost:3000</span>
          <span style={{ color: currentPage.color }}>/{currentPage.key}</span>
        </div>

        {/* transition badge */}
        <div style={{
          fontSize: 9, color: TRANSITIONS[transKey].color,
          background: TRANSITIONS[transKey].color + "22",
          border: `1px solid ${TRANSITIONS[transKey].color}44`,
          borderRadius: 5, padding: "2px 8px",
          fontFamily: "JetBrains Mono, monospace",
        }}>
          {transKey}
        </div>
      </div>

      {/* page area */}
      <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
        {/* exiting page */}
        {transitioning && prevPage && (
          <ExitingPage
            page={prevPage}
            transKey={transKey}
            direction={direction}
            onDone={onTransitionEnd}
          />
        )}
        {/* entering page */}
        <AnimatedPage
          key={`${currentPage.key}-${transKey}`}
          page={currentPage}
          transKey={transKey}
          direction={direction}
        />
      </div>
    </div>
  );
}

// ── Code display ──────────────────────────────────────────────────────────────
function CodeDisplay({ transKey }) {
  const trans = TRANSITIONS[transKey];
  const code = `// ${transKey} transition
const variants = {
  initial: ${JSON.stringify(trans.initial(1)).replace(/"/g, "'")},
  animate: ${JSON.stringify(trans.animate(1)).replace(/"/g, "'")},
  exit:    ${JSON.stringify(trans.exit(1)).replace(/"/g, "'")},
};

<motion.div
  variants={variants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{
    duration: ${trans.duration},
    ease: "${trans.ease}",
  }}
/>`;

  return (
    <pre style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "14px 16px", margin: 0,
      fontSize: 10, lineHeight: 1.8,
      fontFamily: "JetBrains Mono, monospace",
      color: C.muted, overflowX: "auto", whiteSpace: "pre",
    }}>
      {code.split("\n").map((line, i) => {
        // simple highlight
        const styled = line
          .split(/(".*?"|'.*?'|\b\d+\.?\d*\b|\/\/.*$|initial|animate|exit|variants|duration|ease|motion\.div|type|mode)/)
          .map((seg, j) => {
            if (!seg) return null;
            const color =
              seg.startsWith("//") ? C.muted :
              /^["']/.test(seg) ? C.green :
              /^\d/.test(seg) ? C.orange :
              ["initial","animate","exit","variants","duration","ease"].includes(seg) ? C.accent :
              seg === "motion.div" ? C.purple :
              C.muted;
            return <span key={j} style={{ color }}>{seg}</span>;
          });
        return <div key={i}>{styled}</div>;
      })}
    </pre>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PageTransitionsDemo() {
  const [pageIdx, setPageIdx]       = useState(0);
  const [prevPageIdx, setPrevPageIdx] = useState(null);
  const [transKey, setTransKey]     = useState("slide");
  const [direction, setDirection]   = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [duration, setDuration]     = useState(null); // ms display
  const lockRef = useRef(false);

  const currentPage = PAGES[pageIdx];
  const prevPage    = prevPageIdx !== null ? PAGES[prevPageIdx] : null;

  const navigate = useCallback((idx) => {
    if (lockRef.current || idx === pageIdx) return;
    const dir = idx > pageIdx ? 1 : -1;
    setDirection(dir);
    setPrevPageIdx(pageIdx);
    setPageIdx(idx);
    setTransitioning(true);
    lockRef.current = true;

    const dur = TRANSITIONS[transKey].duration;
    setDuration(Math.round(dur * 1000));
    setTimeout(() => {
      lockRef.current = false;
      setTransitioning(false);
      setPrevPageIdx(null);
    }, dur * 1000 + 50);
  }, [pageIdx, transKey]);

  const handleTransitionEnd = useCallback(() => {
    // handled by timeout above
  }, []);

  const changeTransition = (key) => {
    if (!lockRef.current) setTransKey(key);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "26px 18px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 660 }}>

        {/* Header */}
        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
            // page transitions demo
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
            AnimatePresence
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>
            pick a transition type → navigate between pages
          </p>
        </div>

        {/* Transition picker */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 16px", marginBottom: 14,
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// transition type</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {Object.entries(TRANSITIONS).map(([key, t]) => (
              <button key={key} onClick={() => changeTransition(key)} style={{
                background: transKey === key ? t.color + "22" : "transparent",
                border: `1px solid ${transKey === key ? t.color : C.border}`,
                borderRadius: 7, padding: "5px 14px",
                color: transKey === key ? t.color : C.muted,
                fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              }}>
                <span>{t.label}</span>
                <span style={{ fontSize: 8, opacity: 0.7 }}>{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mini browser */}
        <MiniBrowser
          currentPage={currentPage}
          prevPage={prevPage}
          transKey={transKey}
          direction={direction}
          transitioning={transitioning}
          onTransitionEnd={handleTransitionEnd}
        />

        {/* Nav tabs */}
        <div style={{
          display: "flex", gap: 6, marginTop: 12,
        }}>
          {PAGES.map((page, i) => (
            <button key={page.key} onClick={() => navigate(i)} style={{
              flex: 1,
              background: pageIdx === i ? page.color + "22" : C.surface,
              border: `1px solid ${pageIdx === i ? page.color : C.border}`,
              borderRadius: 9, padding: "9px 6px",
              color: pageIdx === i ? page.color : C.muted,
              fontSize: 11, cursor: pageIdx === i ? "default" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <span style={{ fontSize: 16 }}>{page.icon}</span>
              <span>{page.label}</span>
            </button>
          ))}
        </div>

        {/* timing display */}
        <div style={{
          marginTop: 10, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8,
          fontSize: 10, color: C.muted,
        }}>
          <span>duration:</span>
          <span style={{ color: TRANSITIONS[transKey].color, fontWeight: 700 }}>
            {Math.round(TRANSITIONS[transKey].duration * 1000)}ms
          </span>
          <span>·</span>
          <span>ease:</span>
          <span style={{ color: TRANSITIONS[transKey].color }}>
            {TRANSITIONS[transKey].ease}
          </span>
          <span>·</span>
          <span>mode="wait"</span>
        </div>

        {/* Code */}
        <div style={{ marginTop: 14 }}>
          <CodeDisplay transKey={transKey} />
        </div>

        {/* AnimatePresence explanation */}
        <div style={{
          marginTop: 12,
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 16px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          fontSize: 10, color: C.muted,
        }}>
          <div>
            <div style={{ color: C.accent, marginBottom: 4, fontWeight: 700 }}>AnimatePresence</div>
            detects when children unmount and runs their exit animation before removing from DOM
          </div>
          <div>
            <div style={{ color: C.purple, marginBottom: 4, fontWeight: 700 }}>mode="wait"</div>
            waits for exit animation to finish before starting enter — prevents both pages rendering simultaneously
          </div>
        </div>

      </div>
    </div>
  );
}
