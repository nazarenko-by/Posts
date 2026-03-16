import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14",
  surface: "#1a1b2e",
  surface2: "#16213e",
  border: "#2a2c4a",
  text: "#c0caf5",
  muted: "#565f89",
  o1:     "#9ece6a",
  ologn:  "#7dcfff",
  on:     "#bb9af7",
  onlogn: "#e0af68",
  on2:    "#ff9e64",
  o2n:    "#ff5f57",
};

const COMPLEXITIES = [
  { key: "o1",     label: "O(1)",       color: C.o1,     fn: () => 1,                           desc: "array[0], Map.get()" },
  { key: "ologn",  label: "O(log n)",   color: C.ologn,  fn: n => Math.log2(Math.max(n,1)),      desc: "binary search" },
  { key: "on",     label: "O(n)",       color: C.on,     fn: n => n,                             desc: "single loop" },
  { key: "onlogn", label: "O(n log n)", color: C.onlogn, fn: n => n * Math.log2(Math.max(n,1)),  desc: "merge sort, Array.sort()" },
  { key: "on2",    label: "O(n²)",      color: C.on2,    fn: n => n * n,                         desc: "nested loops" },
  { key: "o2n",    label: "O(2ⁿ)",      color: C.o2n,    fn: n => Math.pow(2, Math.min(n, 30)),  desc: "naive recursion" },
];

// ── animated number hook ──────────────────────────────────────────────────────
function useAnimatedNumber(target, duration = 300) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const to = typeof target === "number" ? target : NaN;
    if (isNaN(to) || from === to) { setDisplay(target); return; }

    cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = from + (to - from) * ease;
      setDisplay(Math.round(val));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
      else { fromRef.current = to; setDisplay(to); }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

// ── format ops ───────────────────────────────────────────────────────────────
function formatOps(v) {
  if (v === "∞" || v >= 1e12) return { str: "∞", raw: Infinity };
  if (v >= 1e9) return { str: (v / 1e9).toFixed(1) + "B", raw: v };
  if (v >= 1e6) return { str: (v / 1e6).toFixed(1) + "M", raw: v };
  if (v >= 1e3) return { str: (v / 1e3).toFixed(1) + "K", raw: v };
  return { str: String(Math.round(v)), raw: v };
}

// ── OpsCard with animated number ─────────────────────────────────────────────
function OpsCard({ cplx, value, active, onClick }) {
  const { key, label, color, desc } = cplx;
  const fmt = formatOps(value);
  const animated = useAnimatedNumber(isFinite(fmt.raw) ? fmt.raw : null, 250);

  const displayStr = !isFinite(fmt.raw)
    ? "∞"
    : animated >= 1e9 ? (animated / 1e9).toFixed(1) + "B"
    : animated >= 1e6 ? (animated / 1e6).toFixed(1) + "M"
    : animated >= 1e3 ? (animated / 1e3).toFixed(1) + "K"
    : String(Math.round(animated));

  return (
    <div onClick={onClick} style={{
      background: active ? color + "14" : C.surface2,
      border: `1px solid ${active ? color + "66" : C.border}`,
      borderRadius: 9, padding: "10px 12px",
      opacity: active ? 1 : 0.38,
      cursor: "pointer", transition: "all 0.25s",
      userSelect: "none",
    }}>
      <div style={{ fontSize: 11, color: active ? color : C.muted, fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div style={{
        fontSize: 20, fontWeight: 800, color: active ? C.text : C.muted,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.25s",
        letterSpacing: "-0.5px",
      }}>{displayStr}</div>
      <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>{desc}</div>
    </div>
  );
}

// ── Canvas chart with draw animation + pulsing dots ───────────────────────────
function BigOChart({ active, nValue }) {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const rafRef = useRef(null);
  const pulseRef = useRef(0);
  const lastNRef = useRef(nValue);
  const burstRef = useRef(0); // 0..1 for burst on n change

  // animate draw progress on mount
  useEffect(() => {
    progressRef.current = 0;
    const start = performance.now();
    const dur = 1400;

    const tick = (ts) => {
      const p = Math.min((ts - start) / dur, 1);
      progressRef.current = p < 1 ? 1 - Math.pow(1 - p, 3) : 1;
      drawFrame();
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // pulse loop
  useEffect(() => {
    let animId;
    const loop = (ts) => {
      pulseRef.current = ts;
      drawFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [active, nValue]);

  // burst when n changes
  useEffect(() => {
    if (lastNRef.current !== nValue) {
      lastNRef.current = nValue;
      burstRef.current = 1;
      const decay = setInterval(() => {
        burstRef.current = Math.max(0, burstRef.current - 0.08);
        if (burstRef.current <= 0) clearInterval(decay);
      }, 16);
    }
  }, [nValue]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = { top: 20, right: 24, bottom: 38, left: 50 };
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.surface2;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 12);
    ctx.fill();

    const maxN = 50;
    const maxY = maxN * maxN * 0.55;
    const toX = n => pad.left + (n / maxN) * iW;
    const toY = v => pad.top + iH - Math.min(v / maxY, 1) * iH;

    // grid
    ctx.strokeStyle = C.border + "99";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (i / 5) * iH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iW, y); ctx.stroke();
      const x = pad.left + (i / 5) * iW;
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + iH); ctx.stroke();
    }

    // axes
    ctx.strokeStyle = C.muted + "cc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + iH);
    ctx.lineTo(pad.left + iW, pad.top + iH);
    ctx.stroke();

    // axis labels
    ctx.fillStyle = C.muted;
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText("input size  n →", pad.left + iW / 2, H - 4);
    ctx.save();
    ctx.translate(11, pad.top + iH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("operations →", 0, 0);
    ctx.restore();

    // x ticks
    for (let i = 0; i <= 5; i++) {
      const n = Math.round((i / 5) * maxN);
      ctx.fillStyle = C.muted + "aa";
      ctx.font = "8px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(n, toX(n), pad.top + iH + 12);
    }

    const drawProgress = progressRef.current;

    // draw curves
    COMPLEXITIES.forEach(({ key, color, fn }) => {
      if (!active[key]) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const totalSteps = 200;
      const drawSteps = Math.floor(totalSteps * drawProgress);

      let started = false;
      for (let s = 0; s <= drawSteps; s++) {
        const n = 0.5 + (s / totalSteps) * (maxN - 0.5);
        const v = fn(n);
        const x = toX(n);
        const y = toY(v);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // vertical line at nValue
    if (nValue > 0 && nValue <= maxN && drawProgress > 0.5) {
      const xLine = toX(nValue);
      ctx.strokeStyle = C.text + "33";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xLine, pad.top);
      ctx.lineTo(xLine, pad.top + iH);
      ctx.stroke();
      ctx.setLineDash([]);

      // n label
      ctx.fillStyle = C.text + "88";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`n=${nValue}`, xLine, pad.top - 6);

      const ts = pulseRef.current;
      const pulse = (Math.sin(ts / 400) + 1) / 2; // 0..1
      const burst = burstRef.current;

      // dots on each active curve
      COMPLEXITIES.forEach(({ key, color, fn }) => {
        if (!active[key]) return;
        const v = fn(nValue);
        const x = toX(nValue);
        const y = toY(v);

        // burst ring
        if (burst > 0) {
          const r = 6 + (1 - burst) * 14;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.strokeStyle = color + Math.floor(burst * 200).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // outer glow ring (pulse)
        const outerR = 7 + pulse * 4;
        const alpha = Math.floor((0.15 + pulse * 0.2) * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(x, y, outerR, 0, Math.PI * 2);
        ctx.fillStyle = color + alpha;
        ctx.fill();

        // inner dot
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + pulse * 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }
  }, [active, nValue]);

  return (
    <canvas ref={canvasRef} width={640} height={300}
      style={{ width: "100%", height: "auto", borderRadius: 12, display: "block" }} />
  );
}

// ── Live benchmark ────────────────────────────────────────────────────────────
function benchmark(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  const R = {};

  let t = performance.now();
  for (let r = 0; r < 50000; r++) void arr[0];
  R.o1 = ((performance.now() - t) / 50000 * 1e6).toFixed(2);

  t = performance.now();
  for (let r = 0; r < 2000; r++) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] === n - 1) break; arr[m] < n - 1 ? (lo = m + 1) : (hi = m - 1); }
  }
  R.ologn = ((performance.now() - t) / 2000 * 1e3).toFixed(3);

  t = performance.now();
  for (let r = 0; r < 200; r++) for (let i = 0; i < arr.length; i++) void arr[i];
  R.on = ((performance.now() - t) / 200 * 1e3).toFixed(3);

  t = performance.now();
  for (let r = 0; r < 30; r++) [...arr].sort((a, b) => a - b);
  R.onlogn = ((performance.now() - t) / 30 * 1e3).toFixed(3);

  const n2 = Math.min(n, 3000);
  const a2 = arr.slice(0, n2);
  t = performance.now();
  for (let i = 0; i < a2.length; i++) for (let j = i + 1; j < a2.length; j++) void (a2[i] === a2[j]);
  R.on2 = ((performance.now() - t) * 1e3).toFixed(3);

  return R;
}

// ── Animated bar ──────────────────────────────────────────────────────────────
function BenchBar({ label, color, value, unit, pct, desc, delay }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.max(pct, 0.4)), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 80, fontSize: 11, color, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 22, background: C.surface2, borderRadius: 5, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: `linear-gradient(90deg, ${color}44, ${color}88)`,
          borderRadius: 5,
          transition: `width 0.7s cubic-bezier(0.22,1,0.36,1)`,
          boxShadow: `0 0 8px ${color}44`,
        }} />
        <span style={{
          position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
          fontSize: 10, color: C.text, fontFamily: "JetBrains Mono, monospace",
        }}>{value} {unit}</span>
      </div>
      <span style={{ width: 120, fontSize: 9, color: C.muted, flexShrink: 0 }}>{desc}</span>
    </div>
  );
}

// ── Shimmer placeholder ───────────────────────────────────────────────────────
function ShimmerBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 80, height: 12, background: C.border, borderRadius: 4,
        animation: "shimmer 1.2s ease-in-out infinite", opacity: 0.6 }} />
      <div style={{ flex: 1, height: 22, background: C.border, borderRadius: 5,
        animation: "shimmer 1.2s ease-in-out infinite" }} />
      <div style={{ width: 100, height: 10, background: C.border, borderRadius: 4,
        animation: "shimmer 1.2s ease-in-out infinite", opacity: 0.4 }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BigOViz() {
  const [active, setActive] = useState({ o1: true, ologn: true, on: true, onlogn: true, on2: true, o2n: false });
  const [nValue, setNValue] = useState(20);
  const [benchN, setBenchN] = useState(1000);
  const [benchResult, setBenchResult] = useState(null);
  const [benchRunning, setBenchRunning] = useState(false);

  const toggleKey = k => setActive(p => ({ ...p, [k]: !p[k] }));

  const runBench = useCallback(() => {
    setBenchRunning(true);
    setBenchResult(null);
    setTimeout(() => {
      setBenchResult(benchmark(benchN));
      setBenchRunning(false);
    }, 80);
  }, [benchN]);

  const benchUnits = { o1: "ns", ologn: "µs", on: "µs", onlogn: "µs", on2: "µs" };
  const benchDescs = { o1: "array[0], Map.get()", ologn: "binary search", on: "single loop", onlogn: "Array.sort()", on2: "nested loops (n≤3000)" };

  const maxBench = benchResult ? Math.max(...Object.values(benchResult).map(parseFloat)) : 1;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "28px 20px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 0.4 }
          50%  { opacity: 0.8 }
          100% { opacity: 0.4 }
        }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: #2a2c4a; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #bb9af7; cursor: pointer; box-shadow: 0 0 8px #bb9af7aa; transition: transform 0.15s; }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.3); }
        select option { background: #1a1b2e; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 680 }}>

        {/* Header */}
        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
            // algorithm complexity
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text }}>
            Big O Notation
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>
            how operations grow as input size increases
          </p>
        </div>

        {/* Chart */}
        <div style={{ marginBottom: 14 }}>
          <BigOChart active={active} nValue={nValue} />
        </div>

        {/* Slider + cards */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "16px 18px", marginBottom: 14,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: C.muted }}>
              n = <span style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>{nValue}</span>
            </span>
            <span style={{ fontSize: 10, color: C.muted }}>drag → see ops at each n</span>
          </div>
          <input type="range" min={1} max={50} value={nValue}
            onChange={e => setNValue(Number(e.target.value))}
            style={{ width: "100%", marginBottom: 14 }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {COMPLEXITIES.filter(c => c.key !== "o2n" || active.o2n).map(cplx => (
              <OpsCard
                key={cplx.key}
                cplx={cplx}
                value={cplx.fn(nValue)}
                active={active[cplx.key]}
                onClick={() => toggleKey(cplx.key)}
              />
            ))}
          </div>
        </div>

        {/* Toggle legend */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 16px", marginBottom: 14,
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// toggle curves (click card or button)</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {COMPLEXITIES.map(({ key, label, color }) => (
              <button key={key} onClick={() => toggleKey(key)} style={{
                background: active[key] ? color + "20" : "transparent",
                border: `1px solid ${active[key] ? color : C.border}`,
                borderRadius: 7, padding: "5px 13px",
                color: active[key] ? color : C.muted,
                fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: active[key] ? color : C.muted,
                  display: "inline-block",
                  boxShadow: active[key] ? `0 0 6px ${color}` : "none",
                  transition: "all 0.2s",
                }} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Live benchmark */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "16px 18px",
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 14 }}>
            // live benchmark — real execution time in your browser
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: C.muted }}>n =</span>
              <select value={benchN} onChange={e => setBenchN(Number(e.target.value))} style={{
                background: C.surface2, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "7px 12px", color: C.text,
                fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer",
              }}>
                {[100, 500, 1000, 5000, 10000, 50000].map(v => (
                  <option key={v} value={v}>{v.toLocaleString()}</option>
                ))}
              </select>
            </div>

            <button onClick={runBench} disabled={benchRunning} style={{
              background: benchRunning ? C.border : C.on,
              border: "none", borderRadius: 8, padding: "7px 22px",
              color: benchRunning ? C.muted : C.bg,
              fontSize: 12, fontWeight: 700,
              cursor: benchRunning ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: !benchRunning ? `0 0 14px ${C.on}55` : "none",
              transition: "all 0.2s",
            }}>
              {benchRunning ? "⏳ measuring..." : "▶ run benchmark"}
            </button>

            <span style={{ fontSize: 10, color: C.muted, alignSelf: "flex-end", paddingBottom: 8 }}>
              O(n²) capped at n=3000
            </span>
          </div>

          {/* bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {benchRunning
              ? [0,1,2,3,4].map(i => <ShimmerBar key={i} />)
              : benchResult
              ? COMPLEXITIES.filter(c => c.key !== "o2n").map(({ key, label, color }, idx) => {
                  const val = benchResult[key];
                  const pct = (parseFloat(val) / maxBench) * 100;
                  return (
                    <BenchBar
                      key={key}
                      label={label}
                      color={color}
                      value={val}
                      unit={benchUnits[key]}
                      pct={pct}
                      desc={benchDescs[key]}
                      delay={idx * 100}
                    />
                  );
                })
              : (
                <div style={{ color: C.muted, fontSize: 11, textAlign: "center", padding: "18px 0" }}>
                  // click "run benchmark" to measure real execution time
                </div>
              )
            }
            {benchResult && (
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`,
                fontSize: 11, color: C.muted,
              }}>
                O(n²) vs O(1):{" "}
                <span style={{ color: C.on2, fontWeight: 700 }}>
                  {Math.round(parseFloat(benchResult.on2) * 1000 / Math.max(parseFloat(benchResult.o1), 0.001)).toLocaleString()}×
                </span>
                {" "}slower at n = {benchN.toLocaleString()}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
