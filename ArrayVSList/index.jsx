import { useState, useRef, useCallback, useEffect } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e", border: "#2a2c4a",
  text: "#c0caf5", muted: "#565f89",
  array:  "#7dcfff",  // blue — array
  list:   "#bb9af7",  // purple — linked list
  green:  "#9ece6a",
  orange: "#ff9e64",
  red:    "#ff5f57",
  yellow: "#e0af68",
};

// ── Linked List impl for benchmark ───────────────────────────────────────────
class LLNode { constructor(v) { this.v = v; this.next = null; } }
class LinkedList {
  constructor() { this.head = null; this.tail = null; this.size = 0; }
  push(v) {
    const n = new LLNode(v);
    if (!this.tail) { this.head = this.tail = n; }
    else { this.tail.next = n; this.tail = n; }
    this.size++;
  }
  unshift(v) {
    const n = new LLNode(v); n.next = this.head; this.head = n;
    if (!this.tail) this.tail = n;
    this.size++;
  }
  get(i) {
    let c = this.head, idx = 0;
    while (c) { if (idx === i) return c.v; c = c.next; idx++; }
    return null;
  }
  insertAt(i, v) {
    if (i === 0) { this.unshift(v); return; }
    let c = this.head, idx = 0;
    while (c && idx < i - 1) { c = c.next; idx++; }
    if (!c) return;
    const n = new LLNode(v); n.next = c.next;
    if (!n.next) this.tail = n;
    c.next = n; this.size++;
  }
  deleteAt(i) {
    if (!this.head) return;
    if (i === 0) { this.head = this.head.next; if (!this.head) this.tail = null; this.size--; return; }
    let c = this.head, idx = 0;
    while (c.next && idx < i - 1) { c = c.next; idx++; }
    if (c.next) { if (c.next === this.tail) this.tail = c; c.next = c.next.next; this.size--; }
  }
}

// ── run benchmark ─────────────────────────────────────────────────────────────
function runBenchmark(n) {
  const REPS = 200;
  const results = {};

  // ── access by index ─────────────────────────────────────────────────────
  const arr = Array.from({ length: n }, (_, i) => i);
  let t = performance.now();
  for (let r = 0; r < REPS * 500; r++) void arr[Math.floor(n / 2)];
  results.access_arr = (performance.now() - t) / (REPS * 500) * 1e6;

  const ll = new LinkedList();
  for (let i = 0; i < n; i++) ll.push(i);
  t = performance.now();
  for (let r = 0; r < REPS; r++) ll.get(Math.floor(n / 2));
  results.access_ll = (performance.now() - t) / REPS * 1e3;

  // ── insert at start ──────────────────────────────────────────────────────
  const arr2 = Array.from({ length: n }, (_, i) => i);
  t = performance.now();
  for (let r = 0; r < REPS; r++) arr2.unshift(99);
  results.insert_start_arr = (performance.now() - t) / REPS * 1e3;

  const ll2 = new LinkedList();
  for (let i = 0; i < n; i++) ll2.push(i);
  t = performance.now();
  for (let r = 0; r < REPS; r++) ll2.unshift(99);
  results.insert_start_ll = (performance.now() - t) / REPS * 1e3;

  // ── insert at middle ─────────────────────────────────────────────────────
  const arr3 = Array.from({ length: n }, (_, i) => i);
  const mid = Math.floor(n / 2);
  t = performance.now();
  for (let r = 0; r < REPS; r++) arr3.splice(mid, 0, 99);
  results.insert_mid_arr = (performance.now() - t) / REPS * 1e3;

  const ll3 = new LinkedList();
  for (let i = 0; i < n; i++) ll3.push(i);
  t = performance.now();
  for (let r = 0; r < REPS; r++) ll3.insertAt(mid, 99);
  results.insert_mid_ll = (performance.now() - t) / REPS * 1e3;

  // ── append to end ────────────────────────────────────────────────────────
  const arr4 = Array.from({ length: n }, (_, i) => i);
  t = performance.now();
  for (let r = 0; r < REPS * 100; r++) { arr4.push(99); arr4.pop(); }
  results.append_arr = (performance.now() - t) / (REPS * 100) * 1e6;

  const ll4 = new LinkedList();
  for (let i = 0; i < n; i++) ll4.push(i);
  t = performance.now();
  for (let r = 0; r < REPS; r++) ll4.push(99);
  results.append_ll = (performance.now() - t) / REPS * 1e3;

  // ── sequential read ──────────────────────────────────────────────────────
  const arr5 = Array.from({ length: n }, (_, i) => i);
  t = performance.now();
  for (let r = 0; r < REPS; r++) { let s = 0; for (let i = 0; i < arr5.length; i++) s += arr5[i]; }
  results.seq_arr = (performance.now() - t) / REPS * 1e3;

  const ll5 = new LinkedList();
  for (let i = 0; i < n; i++) ll5.push(i);
  t = performance.now();
  for (let r = 0; r < REPS; r++) { let s = 0, c = ll5.head; while (c) { s += c.v; c = c.next; } }
  results.seq_ll = (performance.now() - t) / REPS * 1e3;

  return results;
}

// ── Memory visualization canvas with RAF animation ────────────────────────────
function MemoryViz() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const vals = [10, 20, 30, 40, 50];
    const cellW = 32, cellH = 32;
    const arrBaseX = 16, arrY = 48;
    const positions = [
      [20,  H / 2 + 22],
      [120, H / 2 + 50],
      [230, H / 2 + 24],
      [340, H / 2 + 52],
      [450, H / 2 + 26],
    ];
    const nw = 52, nh = 30;

    const draw = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = C.surface2;
      ctx.beginPath(); ctx.roundRect(0, 0, W, H, 10); ctx.fill();

      // ── ARRAY ──────────────────────────────────────────────────────────
      // Header
      ctx.textAlign = "left";
      ctx.fillStyle = C.text;
      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.fillText("Array", 16, 20);
      ctx.fillStyle = C.muted;
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillText("— contiguous memory, O(1) access", 58, 20);

      // Array cycles through elements quickly — every 600ms = feels instant
      const arrCycleDur = 600;
      const accessCycle = Math.floor((elapsed / arrCycleDur) % vals.length);

      // draw cells
      for (let i = 0; i < vals.length + 3; i++) {
        const x = arrBaseX + i * (cellW + 4);
        const isFilled = i < vals.length;
        const isAccessed = i === accessCycle;

        ctx.fillStyle = isAccessed
          ? `rgba(125,207,255,0.20)` : isFilled
          ? `rgba(125,207,255,0.06)` : `rgba(42,44,74,0.2)`;
        ctx.strokeStyle = isAccessed
          ? C.array : isFilled
          ? `rgba(125,207,255,0.5)` : `rgba(42,44,74,0.4)`;
        ctx.lineWidth = isAccessed ? 2 : 1;
        if (isAccessed) { ctx.shadowColor = C.array; ctx.shadowBlur = 8; }
        ctx.beginPath(); ctx.roundRect(x, arrY, cellW, cellH, 4);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        if (isFilled) {
          ctx.fillStyle = isAccessed ? C.array : `rgba(192,202,245,0.9)`;
          ctx.font = `bold 12px JetBrains Mono, monospace`;
          ctx.textAlign = "center";
          ctx.fillText(vals[i], x + cellW / 2, arrY + cellH / 2 + 4);
          ctx.fillStyle = isAccessed ? `rgba(125,207,255,0.8)` : `rgba(86,95,137,0.85)`;
          ctx.font = "7px JetBrains Mono, monospace";
          ctx.fillText(`[${i}]`, x + cellW / 2, arrY + cellH + 11);
        }
      }

      // contiguous brace label
      ctx.strokeStyle = `rgba(125,207,255,0.25)`;
      ctx.lineWidth = 1;
      const braceEnd = arrBaseX + vals.length * (cellW + 4) - 4;
      ctx.beginPath();
      ctx.moveTo(arrBaseX, arrY + cellH + 14);
      ctx.lineTo(braceEnd, arrY + cellH + 14);
      ctx.stroke();
      ctx.fillStyle = `rgba(125,207,255,0.5)`;
      ctx.font = "8px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("side by side in RAM", arrBaseX + (braceEnd - arrBaseX) / 2, arrY + cellH + 25);

      // ── LINKED LIST ────────────────────────────────────────────────────
      ctx.textAlign = "left";
      ctx.fillStyle = C.text;
      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.fillText("Linked List", 16, H / 2 + 14);
      ctx.fillStyle = C.muted;
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillText("— scattered memory, O(n) access", 100, H / 2 + 14);

      // Linked list traversal is SLOW — 800ms per node step
      const llStepDur = 800;
      const totalSteps = vals.length;
      const llCycle = Math.floor((elapsed / llStepDur) % (totalSteps + 2));
      const activeNode = Math.min(llCycle, totalSteps - 1);
      const stepProgress = (elapsed % llStepDur) / llStepDur;

      positions.forEach(([px, py], i) => {
        const halfW = nw / 2;
        const isActive = i === activeNode && llCycle < totalSteps + 1;
        const isPast = i < activeNode && llCycle < totalSteps + 1;

        // value cell
        ctx.fillStyle = isActive ? `rgba(187,154,247,0.28)` : isPast ? `rgba(187,154,247,0.10)` : `rgba(187,154,247,0.06)`;
        ctx.strokeStyle = isActive ? C.list : isPast ? `rgba(187,154,247,0.5)` : `rgba(187,154,247,0.3)`;
        ctx.lineWidth = isActive ? 2 : 1;
        if (isActive) { ctx.shadowColor = C.list; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.roundRect(px, py, halfW - 1, nh, [4, 0, 0, 4]); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isActive ? C.list : `rgba(192,202,245,0.9)`;
        ctx.font = `bold 11px JetBrains Mono, monospace`;
        ctx.textAlign = "center";
        ctx.fillText(vals[i], px + halfW / 2, py + nh / 2 + 4);

        // next pointer cell
        const hasNext = i < vals.length - 1;
        ctx.fillStyle = hasNext ? (isPast || isActive ? `rgba(255,158,100,0.18)` : `rgba(255,158,100,0.06)`) : `rgba(42,44,74,0.3)`;
        ctx.strokeStyle = hasNext ? (isPast || isActive ? `rgba(255,158,100,0.7)` : `rgba(255,158,100,0.3)`) : C.border;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.roundRect(px + halfW, py, halfW - 1, nh, [0, 4, 4, 0]); ctx.fill(); ctx.stroke();
        ctx.fillStyle = hasNext ? (isPast || isActive ? `rgba(255,158,100,0.9)` : `rgba(255,158,100,0.45)`) : C.muted;
        ctx.font = "8px JetBrains Mono, monospace";
        ctx.fillText(hasNext ? "→" : "∅", px + halfW + halfW / 2, py + nh / 2 + 3);

        // memory address
        ctx.fillStyle = `rgba(86,95,137,0.7)`;
        ctx.font = "7px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`0x${(0x1000 + i * 0x3f7).toString(16)}`, px + halfW / 2, py + nh + 12);

        // arrow to next — animated dash offset only on traversed arrows
        if (hasNext) {
          const [nx, ny] = positions[i + 1];
          const startX = px + nw - 1, startY = py + nh / 2;
          const endX = nx, endY = ny + nh / 2;
          const cpX = (startX + endX) / 2, cpY = Math.min(startY, endY) - 18;
          const arrowTraversed = i < activeNode && llCycle < totalSteps + 1;
          const dashOffset = arrowTraversed ? -(elapsed / 40) % 12 : 0;

          ctx.strokeStyle = arrowTraversed ? `rgba(255,158,100,0.9)` : `rgba(255,158,100,0.3)`;
          ctx.lineWidth = arrowTraversed ? 1.8 : 1;
          ctx.setLineDash(arrowTraversed ? [4, 3] : [2, 4]);
          ctx.lineDashOffset = dashOffset;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;

          // arrowhead
          const angle = Math.atan2(endY - cpY, endX - cpX);
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX - 7 * Math.cos(angle - 0.4), endY - 7 * Math.sin(angle - 0.4));
          ctx.lineTo(endX - 7 * Math.cos(angle + 0.4), endY - 7 * Math.sin(angle + 0.4));
          ctx.closePath();
          ctx.fillStyle = arrowTraversed ? `rgba(255,158,100,0.9)` : `rgba(255,158,100,0.3)`;
          ctx.fill();
        }
      });

      // cache miss warning — static, bright
      ctx.fillStyle = C.red;
      ctx.font = "bold 9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("each .next = random memory jump = cache miss ⚠", W / 2, H - 8);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={canvasRef} width={620} height={250}
      style={{ width: "100%", height: "auto", borderRadius: 10, display: "block" }} />
  );
}

// ── Result bar ────────────────────────────────────────────────────────────────
function ResultRow({ label, arrVal, llVal, arrUnit, llUnit, winner, note, delay }) {
  const [w1, setW1] = useState(0);
  const [w2, setW2] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const max = Math.max(arrVal, llVal);
      setW1((arrVal / max) * 100);
      setW2((llVal / max) * 100);
    }, delay);
    return () => clearTimeout(t);
  }, [arrVal, llVal, delay]);

  const fmt = (v, u) => {
    if (u === "ns") return `${v.toFixed(1)} ns`;
    if (u === "µs") return `${v.toFixed(3)} µs`;
    return `${v.toFixed(3)} ms`;
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "baseline" }}>
        <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{label}</span>
        {note && <span style={{ fontSize: 9, color: C.muted }}>{note}</span>}
      </div>
      {/* Array bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 68, fontSize: 10, color: C.array, flexShrink: 0, textAlign: "right" }}>Array</span>
        <div style={{ flex: 1, height: 20, background: C.surface2, borderRadius: 4, overflow: "hidden", position: "relative" }}>
          <div style={{
            height: "100%", width: `${w1}%`,
            background: winner === "array" ? `linear-gradient(90deg,${C.array}55,${C.array}99)` : `linear-gradient(90deg,${C.array}22,${C.array}44)`,
            borderRadius: 4, transition: `width 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            boxShadow: winner === "array" ? `0 0 8px ${C.array}44` : "none",
          }} />
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.text }}>
            {fmt(arrVal, arrUnit)}
          </span>
        </div>
        {winner === "array" && <span style={{ fontSize: 11, color: C.green }}>✓</span>}
      </div>
      {/* LL bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 68, fontSize: 10, color: C.list, flexShrink: 0, textAlign: "right" }}>LinkedList</span>
        <div style={{ flex: 1, height: 20, background: C.surface2, borderRadius: 4, overflow: "hidden", position: "relative" }}>
          <div style={{
            height: "100%", width: `${w2}%`,
            background: winner === "list" ? `linear-gradient(90deg,${C.list}55,${C.list}99)` : `linear-gradient(90deg,${C.list}22,${C.list}44)`,
            borderRadius: 4, transition: `width 0.7s cubic-bezier(0.22,1,0.36,1) ${delay + 80}ms`,
            boxShadow: winner === "list" ? `0 0 8px ${C.list}44` : "none",
          }} />
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.text }}>
            {fmt(llVal, llUnit)}
          </span>
        </div>
        {winner === "list" && <span style={{ fontSize: 11, color: C.green }}>✓</span>}
      </div>
    </div>
  );
}

// ── Shimmer ───────────────────────────────────────────────────────────────────
function Shimmer() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i}>
          <div style={{ height: 10, width: 140, background: C.border, borderRadius: 4, marginBottom: 8, animation: "shimmer 1.2s ease-in-out infinite", opacity: 0.6 }} />
          <div style={{ height: 20, background: C.border, borderRadius: 4, marginBottom: 4, animation: "shimmer 1.2s ease-in-out infinite" }} />
          <div style={{ height: 20, background: C.border, borderRadius: 4, animation: "shimmer 1.2s ease-in-out infinite", opacity: 0.7 }} />
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ArrayVsListViz() {
  const [n, setN] = useState(100000);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState("memory"); // memory | benchmark

  const run = useCallback(() => {
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      setResults(runBenchmark(n));
      setRunning(false);
      setTab("benchmark");
    }, 80);
  }, [n]);

  const OPERATIONS = results ? [
    {
      label: "Access by index  arr[n/2]",
      arrVal: results.access_arr, arrUnit: "ns",
      llVal:  results.access_ll,  llUnit: "µs",
      winner: "array",
      note: "O(1) vs O(n)",
    },
    {
      label: "Insert at start  unshift/prepend",
      arrVal: results.insert_start_arr, arrUnit: "µs",
      llVal:  results.insert_start_ll,  llUnit: "µs",
      winner: results.insert_start_ll <= results.insert_start_arr ? "list" : "array",
      note: "O(n) vs O(1)",
    },
    {
      label: "Insert at middle  splice/insertAt",
      arrVal: results.insert_mid_arr, arrUnit: "µs",
      llVal:  results.insert_mid_ll,  llUnit: "µs",
      winner: results.insert_mid_ll <= results.insert_mid_arr ? "list" : "array",
      note: "O(n) vs O(1)*",
    },
    {
      label: "Append to end  push",
      arrVal: results.append_arr, arrUnit: "ns",
      llVal:  results.append_ll,  llUnit: "µs",
      winner: "array",
      note: "O(1)* vs O(n)**",
    },
    {
      label: "Sequential read  traverse all",
      arrVal: results.seq_arr, arrUnit: "µs",
      llVal:  results.seq_ll,  llUnit: "µs",
      winner: results.seq_arr <= results.seq_ll ? "array" : "list",
      note: "cache friendly vs cache miss",
    },
  ] : [];

  const arrayWins = OPERATIONS.filter(o => o.winner === "array").length;
  const listWins  = OPERATIONS.filter(o => o.winner === "list").length;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "26px 18px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <style>{`
        @keyframes shimmer { 0%{opacity:.4} 50%{opacity:.8} 100%{opacity:.4} }
        input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:#2a2c4a;outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:${C.array};cursor:pointer;box-shadow:0 0 8px ${C.array}88;transition:transform .15s}
        input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.3)}
        select option{background:#1a1b2e}
      `}</style>

      <div style={{ width: "100%", maxWidth: 680 }}>

        {/* Header */}
        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
            // data structure benchmark
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            <span style={{ color: C.array }}>Array</span>
            <span style={{ color: C.muted, margin: "0 10px", fontSize: 16 }}>vs</span>
            <span style={{ color: C.list }}>Linked List</span>
          </h1>
          <p style={{ margin: "7px 0 0", fontSize: 11, color: C.muted }}>
            memory layout + real execution time in your browser
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
          {[["memory", "// memory layout"], ["benchmark", "// live benchmark"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: tab === key ? C.surface : "transparent",
              border: `1px solid ${tab === key ? C.array + "55" : C.border}`,
              borderRadius: 8, padding: "7px 16px",
              color: tab === key ? C.array : C.muted,
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}>
              {label}
              {key === "benchmark" && results &&
                <span style={{ marginLeft: 6, color: C.green, fontSize: 10 }}>●</span>}
            </button>
          ))}
        </div>

        {/* Memory tab */}
        {tab === "memory" && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "16px",marginBottom: 14,
          }}>
            <MemoryViz />
            <div style={{
              marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`,
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11,
            }}>
              <div style={{ background: C.array + "11", border: `1px solid ${C.array}44`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ color: C.array, fontWeight: 700, marginBottom: 4 }}>Array</div>
                <div style={{ color: C.muted, lineHeight: 1.7 }}>
                  ✓ contiguous RAM block<br />
                  ✓ CPU prefetches next cells<br />
                  ✓ index → address in O(1)<br />
                  ✗ insert = shift everything right
                </div>
              </div>
              <div style={{ background: C.list + "11", border: `1px solid ${C.list}44`, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ color: C.list, fontWeight: 700, marginBottom: 4 }}>Linked List</div>
                <div style={{ color: C.muted, lineHeight: 1.7 }}>
                  ✓ insert = change 2 pointers<br />
                  ✓ no shifting needed<br />
                  ✗ nodes scattered in RAM<br />
                  ✗ each .next = cache miss
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benchmark tab */}
        {tab === "benchmark" && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "18px", marginBottom: 14,
          }}>
            {/* controls */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, color: C.muted }}>
                  n = <span style={{ color: C.text }}>{n.toLocaleString()}</span>
                </span>
                <select value={n} onChange={e => setN(Number(e.target.value))} style={{
                  background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "7px 12px", color: C.text,
                  fontSize: 12, fontFamily: "inherit", outline: "none", cursor: "pointer",
                }}>
                  {[100, 500, 1000, 5000, 10000, 100000].map(v => (
                    <option key={v} value={v}>{v.toLocaleString()} elements</option>
                  ))}
                </select>
              </div>

              <button onClick={run} disabled={running} style={{
                background: running ? C.border : C.array,
                border: "none", borderRadius: 8, padding: "7px 22px",
                color: running ? C.muted : C.bg,
                fontSize: 12, fontWeight: 700,
                cursor: running ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: !running ? `0 0 14px ${C.array}44` : "none",
                transition: "all 0.2s",
              }}>
                {running ? "⏳ measuring..." : "▶ run benchmark"}
              </button>
            </div>

            {/* results */}
            {running && <Shimmer />}
            {!running && !results && (
              <div style={{ color: C.muted, fontSize: 11, textAlign: "center", padding: "24px 0" }}>
                // click "run benchmark" to measure real performance
              </div>
            )}
            {!running && results && (
              <>
                {OPERATIONS.map((op, i) => (
                  <ResultRow key={op.label} {...op} delay={i * 120} />
                ))}

                {/* summary */}
                <div style={{
                  marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`,
                  display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 13, color: C.array }}>
                      Array wins: <strong>{arrayWins}/5</strong>
                    </span>
                    <span style={{ fontSize: 13, color: C.list }}>
                      LinkedList wins: <strong>{listWins}/5</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginLeft: "auto" }}>
                    * with ref to node &nbsp;** no tail pointer
                  </div>
                </div>

                <div style={{ marginTop: 10, fontSize: 10, color: C.muted, lineHeight: 1.7 }}>
                  <span style={{ color: C.yellow }}>Note:</span>
                  {" "}LinkedList insert is theoretically O(1) but cache misses make it
                  slower in practice for small/medium n. Array wins due to CPU cache efficiency.
                </div>
              </>
            )}
          </div>
        )}

        {/* Complexity table */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "14px 18px",
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// time complexity</div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 0, fontSize: 10, fontFamily: "JetBrains Mono, monospace",
          }}>
            {[
              ["operation",      "Array",    "Linked List"],
              ["access [i]",     "O(1) ✓",   "O(n) ✗"],
              ["search",         "O(n)",      "O(n)"],
              ["insert start",   "O(n) ✗",   "O(1) ✓"],
              ["insert middle",  "O(n) ✗",   "O(1) ✓*"],
              ["append end",     "O(1)* ✓",  "O(n) ✗**"],
              ["delete",         "O(n) ✗",   "O(1) ✓*"],
              ["memory",         "compact ✓","scattered ✗"],
              ["cache",          "friendly ✓","miss ✗"],
            ].map(([op, arr, ll], i) => {
              const isHeader = i === 0;
              const arrWin = arr.includes("✓") && !arr.includes("✗");
              const llWin  = ll.includes("✓") && !ll.includes("✗");
              return [
                <div key={`op-${i}`} style={{ color: isHeader ? C.array : C.muted, padding: "5px 8px", borderBottom: i < 8 ? `1px solid ${C.border}` : "none", fontWeight: isHeader ? 700 : 400 }}>{op}</div>,
                <div key={`a-${i}`}  style={{ color: isHeader ? C.array : arrWin ? C.green : llWin ? C.red + "cc" : C.text, padding: "5px 8px", borderLeft: `1px solid ${C.border}`, borderBottom: i < 8 ? `1px solid ${C.border}` : "none", textAlign: "center", fontWeight: isHeader ? 700 : 400 }}>{arr}</div>,
                <div key={`l-${i}`}  style={{ color: isHeader ? C.list  : llWin  ? C.green : arrWin ? C.red + "cc" : C.text, padding: "5px 8px", borderLeft: `1px solid ${C.border}`, borderBottom: i < 8 ? `1px solid ${C.border}` : "none", textAlign: "center", fontWeight: isHeader ? 700 : 400 }}>{ll}</div>,
              ];
            })}
            <div style={{ gridColumn: "1/-1", paddingTop: 6, fontSize: 9, color: C.muted + "88" }}>
              * with reference to node &nbsp; ** without tail pointer
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
