import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14",
  surface: "#1a1b2e",
  surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff",
  purple: "#bb9af7",
  green: "#9ece6a",
  orange: "#ff9e64",
  yellow: "#e0af68",
  red: "#ff5f57",
  muted: "#565f89",
  text: "#c0caf5",
};

let idCounter = 100;
const uid = () => ++idCounter;

const INIT_NODES = [10, 20, 30, 40, 50].map((v) => ({
  id: uid(), value: v, state: "idle",
}));

// ── Node ─────────────────────────────────────────────────────────────────────
function Node({ node, isLast }) {
  const stateStyle = {
    idle:     { bg: C.surface2,  border: C.border,  text: C.text,   label: ""         },
    active:   { bg: "#1a2a3a",   border: C.accent,  text: C.accent, label: "current"  },
    new:      { bg: "#1a2e1a",   border: C.green,   text: C.green,  label: "new"      },
    removing: { bg: "#2e1a1a",   border: C.red,     text: C.red,    label: "removing" },
    found:    { bg: "#1a2a1a",   border: C.green,   text: C.green,  label: "visited"  },
  };
  const s = stateStyle[node.state] || stateStyle.idle;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        transition: "all 0.35s ease",
        opacity: node.state === "removing" ? 0.4 : 1,
        transform: node.state === "new" ? "translateY(-6px)" : node.state === "removing" ? "scale(0.88)" : "translateY(0)",
      }}>
        {/* label */}
        <div style={{
          fontSize: 9, fontFamily: "JetBrains Mono, monospace",
          color: s.label ? s.border : "transparent",
          letterSpacing: 1, height: 12, transition: "color 0.3s",
        }}>
          {s.label || "·"}
        </div>

        {/* box */}
        <div style={{
          width: 54, height: 54, borderRadius: 10,
          border: `2px solid ${s.border}`, background: s.bg,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 2,
          transition: "all 0.35s ease",
          boxShadow: node.state !== "idle" ? `0 0 18px ${s.border}55` : "none",
        }}>
          <span style={{
            fontSize: 18, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
            color: s.text, transition: "color 0.3s", lineHeight: 1,
          }}>{node.value}</span>
          <span style={{ fontSize: 7, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>.next</span>
        </div>

        {/* node id */}
        <div style={{ fontSize: 8, color: C.muted + "55", fontFamily: "JetBrains Mono, monospace" }}>
          #{node.id}
        </div>
      </div>

      {/* arrow */}
      {!isLast && (
        <div style={{ display: "flex", alignItems: "center", paddingBottom: 14 }}>
          <div style={{ width: 28, height: 2, background: `linear-gradient(90deg, ${C.border}, ${C.accent}88)` }} />
          <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `7px solid ${C.accent}88` }} />
        </div>
      )}

      {/* null */}
      {isLast && (
        <div style={{ display: "flex", alignItems: "center", paddingBottom: 14 }}>
          <div style={{ width: 20, height: 2, background: C.border }} />
          <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `7px solid ${C.border}` }} />
          <div style={{ marginLeft: 6, fontSize: 11, color: C.orange, fontFamily: "JetBrains Mono, monospace", fontStyle: "italic" }}>null</div>
        </div>
      )}
    </div>
  );
}

// ── Log line ──────────────────────────────────────────────────────────────────
function LogLine({ line }) {
  const colors = { op: C.purple, step: C.accent, ok: C.green, err: C.red, info: C.muted };
  return (
    <div style={{
      fontSize: 11, fontFamily: "JetBrains Mono, monospace",
      color: colors[line.type] || C.muted,
      lineHeight: 1.75, opacity: line.faded ? 0.35 : 1,
      transition: "opacity 0.3s",
    }}>
      <span style={{ color: C.muted + "66", marginRight: 8 }}>{">"}</span>
      {line.text}
    </div>
  );
}

// ── Countdown ring ────────────────────────────────────────────────────────────
function Countdown({ seconds, total }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const progress = seconds / total;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={40} height={40} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={20} cy={20} r={r} fill="none" stroke={C.border} strokeWidth={2.5} />
        <circle cx={20} cy={20} r={r} fill="none" stroke={C.purple} strokeWidth={2.5}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s linear" }}
        />
      </svg>
      <span style={{ fontSize: 13, color: C.purple, fontFamily: "JetBrains Mono, monospace" }}>
        auto in {seconds}s
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LinkedListViz() {
  const [nodes, setNodes] = useState(INIT_NODES);
  const [log, setLog] = useState([
    { type: "info", text: "// linked list initialized" },
    { type: "info", text: "// head → 10 → 20 → 30 → 40 → 50 → null" },
    { type: "info", text: "// auto-demo starts in 15s..." },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [inputIdx, setInputIdx] = useState("");
  const [animating, setAnimating] = useState(false);
  const [mode, setMode] = useState("append");
  const [countdown, setCountdown] = useState(15);
  const [autoStarted, setAutoStarted] = useState(false);

  const animRef = useRef(false);
  const nodesRef = useRef(nodes);
  const countdownRef = useRef(null);
  const autoRef = useRef(false);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const addLog = useCallback((entries) => {
    setLog((prev) => {
      const faded = prev.map((l) => ({ ...l, faded: true }));
      return [...faded.slice(-6), ...entries];
    });
  }, []);

  const resetStates = (ns) => ns.map((n) => ({ ...n, state: "idle" }));

  // ── operations (accept nodes as param for auto-demo chaining) ─────────────

  const doTraverse = useCallback(async (ns) => {
    const snap = (x) => { setNodes([...x]); nodesRef.current = [...x]; };
    addLog([{ type: "op", text: "traverse() — walking the list" }]);
    let cur = ns.map((n) => ({ ...n, state: "idle" }));
    for (let i = 0; i < cur.length; i++) {
      cur = cur.map((n, j) => ({ ...n, state: j === i ? "active" : j < i ? "found" : "idle" }));
      snap(cur);
      addLog([{ type: "step", text: `current = node[${i}] → value: ${cur[i].value}` }]);
      await sleep(480);
    }
    await sleep(300);
    cur = resetStates(cur);
    snap(cur);
    addLog([{ type: "ok", text: `// ✓ traversal done — ${cur.length} nodes` }]);
    return cur;
  }, [addLog]);

  const doAppend = useCallback(async (ns, val) => {
    const snap = (x) => { setNodes([...x]); nodesRef.current = [...x]; };
    addLog([{ type: "op", text: `append(${val}) — insert at tail` }]);
    let cur = ns.map((n) => ({ ...n, state: "idle" }));
    for (let i = 0; i < cur.length; i++) {
      cur = cur.map((n, j) => ({ ...n, state: j === i ? "active" : j < i ? "found" : "idle" }));
      snap(cur);
      addLog([{ type: "step", text: `walk: node[${i}].value = ${cur[i].value}${i === cur.length - 1 ? " ← tail" : ""}` }]);
      await sleep(380);
    }
    const newNode = { id: uid(), value: val, state: "new" };
    cur = [...cur.map((n) => ({ ...n, state: "idle" })), newNode];
    snap(cur);
    addLog([
      { type: "step", text: `tail.next = newNode(${val})` },
      { type: "ok", text: `// ✓ appended. length: ${cur.length}` },
    ]);
    await sleep(800);
    cur = resetStates(cur);
    snap(cur);
    return cur;
  }, [addLog]);

  const doInsertAt = useCallback(async (ns, idx, val) => {
    const snap = (x) => { setNodes([...x]); nodesRef.current = [...x]; };
    addLog([{ type: "op", text: `insertAt(${idx}, ${val})` }]);
    let cur = ns.map((n) => ({ ...n, state: "idle" }));
    if (idx === 0) {
      addLog([{ type: "step", text: `index === 0 → insert before head` }]);
      const newNode = { id: uid(), value: val, state: "new" };
      cur = [newNode, ...cur];
      snap(cur);
      await sleep(800);
      addLog([{ type: "ok", text: `// ✓ new head = ${val}` }]);
    } else {
      for (let i = 0; i < idx - 1; i++) {
        cur = cur.map((n, j) => ({ ...n, state: j === i ? "active" : j < i ? "found" : "idle" }));
        snap(cur);
        addLog([{ type: "step", text: `walk to [${idx - 1}]: at [${i}]` }]);
        await sleep(380);
      }
      cur = cur.map((n, j) => ({ ...n, state: j === idx - 1 ? "active" : "idle" }));
      snap(cur);
      addLog([{ type: "step", text: `stop at [${idx - 1}] → insert after` }]);
      await sleep(500);
      const newNode = { id: uid(), value: val, state: "new" };
      cur = [
        ...cur.slice(0, idx).map((n) => ({ ...n, state: "idle" })),
        newNode,
        ...cur.slice(idx).map((n) => ({ ...n, state: "idle" })),
      ];
      snap(cur);
      addLog([
        { type: "step", text: `newNode.next = node[${idx}]` },
        { type: "step", text: `node[${idx - 1}].next = newNode` },
        { type: "ok", text: `// ✓ inserted ${val} at index ${idx}` },
      ]);
      await sleep(800);
    }
    cur = resetStates(cur);
    snap(cur);
    return cur;
  }, [addLog]);

  const doRemoveAt = useCallback(async (ns, idx) => {
    const snap = (x) => { setNodes([...x]); nodesRef.current = [...x]; };
    addLog([{ type: "op", text: `removeAt(${idx})` }]);
    let cur = ns.map((n) => ({ ...n, state: "idle" }));
    for (let i = 0; i <= idx; i++) {
      cur = cur.map((n, j) => ({
        ...n, state: j === i ? (i === idx ? "removing" : "active") : j < i ? "found" : "idle",
      }));
      snap(cur);
      addLog([{ type: "step", text: `walk: [${i}] → ${cur[i].value}${i === idx ? " ← remove" : ""}` }]);
      await sleep(400);
    }
    await sleep(400);
    const removed = cur[idx].value;
    cur = cur.filter((_, i) => i !== idx).map((n) => ({ ...n, state: "idle" }));
    snap(cur);
    addLog([
      { type: "step", text: `node[${idx - 1}].next = node[${idx + 1}] (bypass)` },
      { type: "ok", text: `// ✓ removed ${removed}. length: ${cur.length}` },
    ]);
    await sleep(500);
    return cur;
  }, [addLog]);

  // ── AUTO DEMO sequence ────────────────────────────────────────────────────
  const runAutoDemo = useCallback(async () => {
    if (autoRef.current) return;
    autoRef.current = true;
    animRef.current = true;
    setAnimating(true);
    setAutoStarted(true);

    addLog([{ type: "op", text: "// ─── auto demo start ───" }]);
    await sleep(600);

    let ns = INIT_NODES.map((n) => ({ ...n, id: uid() }));
    setNodes(ns);
    nodesRef.current = ns;

    // 1. traverse
    setMode("traverse");
    await sleep(400);
    ns = await doTraverse(ns);
    await sleep(800);

    // 2. append 60
    setMode("append");
    await sleep(400);
    ns = await doAppend(ns, 60);
    await sleep(800);

    // 3. insertAt index 2, value 25
    setMode("insertAt");
    await sleep(400);
    ns = await doInsertAt(ns, 2, 25);
    await sleep(800);

    // 4. traverse again to show new state
    setMode("traverse");
    await sleep(400);
    ns = await doTraverse(ns);
    await sleep(800);

    // 5. removeAt index 3
    setMode("remove");
    await sleep(400);
    ns = await doRemoveAt(ns, 3);
    await sleep(800);

    // 6. final traverse
    setMode("traverse");
    await sleep(400);
    ns = await doTraverse(ns);
    await sleep(600);

    addLog([{ type: "ok", text: "// ─── demo complete ───" }]);

    animRef.current = false;
    autoRef.current = false;
    setAnimating(false);
  }, [doTraverse, doAppend, doInsertAt, doRemoveAt, addLog]);

  // ── countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (autoStarted) return;
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [autoStarted]);

  useEffect(() => {
    if (countdown === 0 && !autoStarted) {
      runAutoDemo();
    }
  }, [countdown, autoStarted, runAutoDemo]);

  // ── manual controls ───────────────────────────────────────────────────────
  const startNow = () => {
    clearInterval(countdownRef.current);
    setCountdown(0);
    runAutoDemo();
  };

  const traverse = useCallback(async () => {
    if (animRef.current) return;
    animRef.current = true;
    setAnimating(true);
    const ns = await doTraverse(nodesRef.current);
    setNodes(ns);
    animRef.current = false;
    setAnimating(false);
  }, [doTraverse]);

  const append = useCallback(async () => {
    const val = parseInt(inputVal);
    if (isNaN(val) || animRef.current) return;
    animRef.current = true;
    setAnimating(true);
    const ns = await doAppend(nodesRef.current, val);
    setNodes(ns);
    setInputVal("");
    animRef.current = false;
    setAnimating(false);
  }, [inputVal, doAppend]);

  const insertAt = useCallback(async () => {
    const val = parseInt(inputVal);
    const idx = parseInt(inputIdx);
    if (isNaN(val) || isNaN(idx) || animRef.current) return;
    if (idx < 0 || idx > nodesRef.current.length) return;
    animRef.current = true;
    setAnimating(true);
    const ns = await doInsertAt(nodesRef.current, idx, val);
    setNodes(ns);
    setInputVal(""); setInputIdx("");
    animRef.current = false;
    setAnimating(false);
  }, [inputVal, inputIdx, doInsertAt]);

  const removeAt = useCallback(async () => {
    const idx = parseInt(inputIdx);
    if (isNaN(idx) || idx < 0 || idx >= nodesRef.current.length || animRef.current) return;
    animRef.current = true;
    setAnimating(true);
    const ns = await doRemoveAt(nodesRef.current, idx);
    setNodes(ns);
    setInputIdx("");
    animRef.current = false;
    setAnimating(false);
  }, [inputIdx, doRemoveAt]);

  const reset = () => {
    clearInterval(countdownRef.current);
    animRef.current = false;
    autoRef.current = false;
    setAnimating(false);
    setAutoStarted(false);
    setCountdown(15);
    const fresh = INIT_NODES.map((n) => ({ ...n, id: uid() }));
    setNodes(fresh);
    nodesRef.current = fresh;
    setLog([
      { type: "info", text: "// linked list initialized" },
      { type: "info", text: "// head → 10 → 20 → 30 → 40 → 50 → null" },
      { type: "info", text: "// auto-demo starts in 15s..." },
    ]);
    setInputVal(""); setInputIdx("");
    setMode("append");
  };

  const modeConfig = {
    append:   { label: "append",   color: C.green,  desc: "insert at tail — O(n) without tail pointer" },
    insertAt: { label: "insertAt", color: C.accent, desc: "insert at index — O(1) with ref, O(n) without" },
    remove:   { label: "removeAt", color: C.red,    desc: "remove at index — O(n) walk + O(1) bypass" },
    traverse: { label: "traverse", color: C.purple, desc: "walk the entire list — O(n)" },
  };

  const canRun = () => {
    if (animating) return false;
    if (mode === "traverse") return true;
    if (mode === "append") return inputVal !== "";
    if (mode === "insertAt") return inputVal !== "" && inputIdx !== "";
    if (mode === "remove") return inputIdx !== "";
    return false;
  };

  const handleRun = () => {
    if (!canRun()) return;
    clearInterval(countdownRef.current);
    setAutoStarted(true);
    if (mode === "traverse") traverse();
    else if (mode === "append") append();
    else if (mode === "insertAt") insertAt();
    else if (mode === "remove") removeAt();
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "32px 20px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
              // data structure visualization
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text }}>
              Linked List
            </h1>
            <div style={{ marginTop: 7, fontSize: 11, color: C.muted }}>
              <span style={{ color: C.purple }}>head</span>{" → "}
              <span style={{ color: C.accent }}>node</span>{" → "}
              <span style={{ color: C.accent }}>node</span>{" → "}
              <span style={{ color: C.orange }}>null</span>
            </div>
          </div>

          {/* Countdown / status */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {!autoStarted && countdown > 0 ? (
              <>
                <Countdown seconds={countdown} total={15} />
                <button onClick={startNow} style={{
                  background: "transparent",
                  border: `1px solid ${C.purple}88`,
                  borderRadius: 7, padding: "4px 12px",
                  color: C.purple, fontSize: 11, cursor: "pointer",
                  fontFamily: "inherit",
                }}>
                  ▶ start now
                </button>
              </>
            ) : (
              <div style={{ fontSize: 11, color: C.green, letterSpacing: 1 }}>
                {animating ? "⏳ running..." : "✓ demo done"}
              </div>
            )}
          </div>
        </div>

        {/* List visualization */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "20px 20px 14px", marginBottom: 14,
          overflowX: "auto",
        }}>
          <div style={{ fontSize: 10, color: C.purple, marginBottom: 10, letterSpacing: 1 }}>
            head ↓
          </div>
          <div style={{ display: "flex", alignItems: "center", minWidth: "max-content", paddingBottom: 4 }}>
            {nodes.length === 0
              ? <div style={{ color: C.muted, fontSize: 13, padding: "16px 0" }}>// empty list — head → null</div>
              : nodes.map((node, i) => (
                  <Node key={node.id} node={node} isLast={i === nodes.length - 1} />
                ))
            }
          </div>
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`,
            display: "flex", gap: 20, fontSize: 10, color: C.muted,
          }}>
            <span>length: <span style={{ color: C.accent }}>{nodes.length}</span></span>
            <span>insert: <span style={{ color: C.green }}>O(1)</span><span style={{ color: C.muted + "66" }}>*</span></span>
            <span>access: <span style={{ color: C.orange }}>O(n)</span></span>
            <span style={{ color: C.muted + "44" }}>* with ref to node</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "16px 20px", marginBottom: 14,
        }}>
          {/* mode tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {Object.entries(modeConfig).map(([key, cfg]) => (
              <button key={key} onClick={() => !animating && setMode(key)} style={{
                background: mode === key ? cfg.color + "22" : "transparent",
                border: `1px solid ${mode === key ? cfg.color : C.border}`,
                borderRadius: 7, padding: "5px 14px",
                color: mode === key ? cfg.color : C.muted,
                fontSize: 12, cursor: animating ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.2s",
              }}>{cfg.label}</button>
            ))}
          </div>

          {/* inputs row */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
            {mode !== "traverse" && mode !== "remove" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 10, color: C.muted }}>value</span>
                <input type="number" value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  placeholder="42" disabled={animating}
                  style={{
                    width: 72, background: C.surface2, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "7px 10px", color: C.text,
                    fontSize: 13, fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>
            )}
            {(mode === "insertAt" || mode === "remove") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 10, color: C.muted }}>
                  index (0–{nodes.length - (mode === "remove" ? 1 : 0)})
                </span>
                <input type="number" value={inputIdx}
                  onChange={(e) => setInputIdx(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  placeholder="0" min={0}
                  max={mode === "remove" ? nodes.length - 1 : nodes.length}
                  disabled={animating}
                  style={{
                    width: 72, background: C.surface2, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "7px 10px", color: C.text,
                    fontSize: 13, fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>
            )}
            <button onClick={handleRun} disabled={!canRun()} style={{
              background: canRun() ? modeConfig[mode].color : C.border,
              border: "none", borderRadius: 8, padding: "7px 22px",
              color: canRun() ? C.bg : C.muted, fontSize: 13, fontWeight: 700,
              cursor: canRun() ? "pointer" : "not-allowed",
              fontFamily: "inherit", transition: "all 0.2s",
            }}>
              {animating ? "⏳" : "▶ run"}
            </button>
            <button onClick={reset} disabled={animating} style={{
              background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "7px 16px", color: C.muted,
              fontSize: 12, cursor: animating ? "not-allowed" : "pointer",
              fontFamily: "inherit", marginLeft: "auto",
            }}>↺ reset</button>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
            <span style={{ color: modeConfig[mode].color }}>{modeConfig[mode].label}</span>
            {" — "}{modeConfig[mode].desc}
          </div>
        </div>

        {/* Console log */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "14px 18px",
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>// console</div>
          {log.map((line, i) => <LogLine key={i} line={line} />)}
        </div>

      </div>
    </div>
  );
}
