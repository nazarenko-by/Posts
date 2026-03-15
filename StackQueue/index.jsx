import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14",
  surface: "#1a1b2e",
  surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff",    // stack color
  purple: "#bb9af7",    // queue color
  green: "#9ece6a",
  orange: "#ff9e64",
  red: "#ff5f57",
  muted: "#565f89",
  text: "#c0caf5",
  yellow: "#e0af68",
};

let idCounter = 0;
const uid = () => ++idCounter;

// ── Item component ────────────────────────────────────────────────────────────
function Item({ item, direction = "stack", isTop = false, isFirst = false }) {
  const stateColors = {
    idle:     { bg: C.surface2,  border: C.border,   text: C.text   },
    entering: { bg: "#1a2e1a",   border: C.green,    text: C.green  },
    leaving:  { bg: "#2e1a1a",   border: C.red,       text: C.red   },
    peek:     { bg: "#1a2a3a",   border: C.accent,   text: C.accent },
  };
  const s = stateColors[item.state] || stateColors.idle;

  const highlight = isTop && direction === "stack";
  const highlightQ = isFirst && direction === "queue";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: direction === "queue" ? 52 : "100%",
      height: direction === "stack" ? 44 : 52,
      borderRadius: 8,
      border: `2px solid ${(highlight || highlightQ) && item.state === "idle" ? C.border + "cc" : s.border}`,
      background: s.bg,
      position: "relative",
      transition: "all 0.3s ease",
      boxShadow: item.state !== "idle" ? `0 0 14px ${s.border}44` : "none",
      transform: item.state === "entering"
        ? direction === "stack" ? "scaleY(1.05)" : "scaleX(1.05)"
        : item.state === "leaving"
        ? direction === "stack" ? "scaleY(0.9)" : "scaleX(0.9)"
        : "scale(1)",
      opacity: item.state === "leaving" ? 0.5 : 1,
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: 16, fontWeight: 700,
        fontFamily: "JetBrains Mono, monospace",
        color: s.text, transition: "color 0.3s",
      }}>{item.value}</span>

      {/* top/front label */}
      {highlight && (
        <span style={{
          position: "absolute", right: -32, top: "50%", transform: "translateY(-50%)",
          fontSize: 8, color: C.accent, fontFamily: "JetBrains Mono, monospace",
          letterSpacing: 0.5,
        }}>← top</span>
      )}
      {highlightQ && (
        <span style={{
          position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)",
          fontSize: 8, color: C.purple, fontFamily: "JetBrains Mono, monospace",
          letterSpacing: 0.5, whiteSpace: "nowrap",
        }}>↑ front</span>
      )}
    </div>
  );
}

// ── Stack panel ───────────────────────────────────────────────────────────────
function StackPanel({ items, lastOp }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: "hidden", minWidth: 0,
    }}>
      {/* header */}
      <div style={{
        background: C.surface2, padding: "12px 16px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <span style={{ color: C.accent, fontSize: 14, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>Stack</span>
          <span style={{ color: C.muted, fontSize: 11, fontFamily: "JetBrains Mono, monospace", marginLeft: 8 }}>LIFO</span>
        </div>
        <span style={{ fontSize: 10, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>
          size: <span style={{ color: C.accent }}>{items.length}</span>
        </span>
      </div>

      {/* push arrow */}
      <div style={{ padding: "8px 16px 4px", textAlign: "center" }}>
        <span style={{ fontSize: 10, color: C.green, fontFamily: "JetBrains Mono, monospace" }}>push() ↓</span>
      </div>

      {/* items - top to bottom visually */}
      <div style={{
        flex: 1, padding: "4px 24px 16px",
        display: "flex", flexDirection: "column", gap: 5,
        minHeight: 200,
        justifyContent: "flex-start",
      }}>
        {items.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: C.muted, fontSize: 12, fontFamily: "JetBrains Mono, monospace",
          }}>// empty</div>
        ) : (
          [...items].reverse().map((item, i) => (
            <Item key={item.id} item={item} direction="stack" isTop={i === 0} />
          ))
        )}
      </div>

      {/* pop arrow */}
      <div style={{ padding: "4px 16px 10px", textAlign: "center" }}>
        <span style={{ fontSize: 10, color: C.red, fontFamily: "JetBrains Mono, monospace" }}>pop() ↑</span>
      </div>

      {/* last op */}
      <div style={{
        borderTop: `1px solid ${C.border}`, padding: "8px 14px",
        fontSize: 10, fontFamily: "JetBrains Mono, monospace",
        color: lastOp?.type === "ok" ? C.green : lastOp?.type === "out" ? C.red : C.muted,
        minHeight: 30,
      }}>
        {lastOp ? `> ${lastOp.text}` : "> ready"}
      </div>
    </div>
  );
}

// ── Queue panel ───────────────────────────────────────────────────────────────
function QueuePanel({ items, lastOp }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: "hidden", minWidth: 0,
    }}>
      {/* header */}
      <div style={{
        background: C.surface2, padding: "12px 16px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <span style={{ color: C.purple, fontSize: 14, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>Queue</span>
          <span style={{ color: C.muted, fontSize: 11, fontFamily: "JetBrains Mono, monospace", marginLeft: 8 }}>FIFO</span>
        </div>
        <span style={{ fontSize: 10, color: C.muted, fontFamily: "JetBrains Mono, monospace" }}>
          size: <span style={{ color: C.purple }}>{items.length}</span>
        </span>
      </div>

      {/* enqueue arrow */}
      <div style={{ padding: "8px 16px 4px", textAlign: "right", paddingRight: 24 }}>
        <span style={{ fontSize: 10, color: C.green, fontFamily: "JetBrains Mono, monospace" }}>enqueue() →</span>
      </div>

      {/* items - left to right */}
      <div style={{
        flex: 1, padding: "16px 16px 24px",
        display: "flex", flexDirection: "row", alignItems: "center",
        gap: 5, minHeight: 160, overflowX: "auto",
        justifyContent: "flex-end",
      }}>
        {items.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: C.muted, fontSize: 12, fontFamily: "JetBrains Mono, monospace",
          }}>// empty</div>
        ) : (
          items.map((item, i) => (
            <Item key={item.id} item={item} direction="queue" isFirst={i === 0} />
          ))
        )}
      </div>

      {/* dequeue arrow */}
      <div style={{ padding: "0 16px 10px", textAlign: "left", paddingLeft: 24 }}>
        <span style={{ fontSize: 10, color: C.red, fontFamily: "JetBrains Mono, monospace" }}>← dequeue()</span>
      </div>

      {/* last op */}
      <div style={{
        borderTop: `1px solid ${C.border}`, padding: "8px 14px",
        fontSize: 10, fontFamily: "JetBrains Mono, monospace",
        color: lastOp?.type === "ok" ? C.green : lastOp?.type === "out" ? C.red : C.muted,
        minHeight: 30,
      }}>
        {lastOp ? `> ${lastOp.text}` : "> ready"}
      </div>
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function Countdown({ seconds, total }) {
  const r = 14, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <svg width={36} height={36} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={18} cy={18} r={r} fill="none" stroke={C.border} strokeWidth={2.5} />
        <circle cx={18} cy={18} r={r} fill="none" stroke={C.yellow} strokeWidth={2.5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - seconds / total)}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.95s linear" }} />
      </svg>
      <span style={{ fontSize: 12, color: C.yellow, fontFamily: "JetBrains Mono, monospace" }}>
        auto in {seconds}s
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StackQueueViz() {
  const [stackItems, setStackItems] = useState([]);
  const [queueItems, setQueueItems] = useState([]);
  const [stackOp, setStackOp] = useState(null);
  const [queueOp, setQueueOp] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [animating, setAnimating] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [autoStarted, setAutoStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("both"); // both | stack | queue

  const animRef = useRef(false);
  const autoRef = useRef(false);
  const countdownRef = useRef(null);
  const stackRef = useRef([]);
  const queueRef = useRef([]);

  useEffect(() => { stackRef.current = stackItems; }, [stackItems]);
  useEffect(() => { queueRef.current = queueItems; }, [queueItems]);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── stack ops ─────────────────────────────────────────────────────────────
  const doPush = useCallback(async (val, st) => {
    const newItem = { id: uid(), value: val, state: "entering" };
    const next = [...st, newItem];
    setStackItems([...next]);
    stackRef.current = next;
    setStackOp({ type: "ok", text: `push(${val}) → size: ${next.length}` });
    await sleep(500);
    const settled = next.map(n => n.id === newItem.id ? { ...n, state: "idle" } : n);
    setStackItems(settled);
    stackRef.current = settled;
    return settled;
  }, []);

  const doPop = useCallback(async (st) => {
    if (!st.length) { setStackOp({ type: "err", text: "pop() → stack is empty!" }); return st; }
    const top = st[st.length - 1];
    const marked = st.map(n => n.id === top.id ? { ...n, state: "leaving" } : n);
    setStackItems(marked);
    stackRef.current = marked;
    setStackOp({ type: "out", text: `pop() → ${top.value} removed` });
    await sleep(500);
    const next = marked.filter(n => n.id !== top.id);
    setStackItems(next);
    stackRef.current = next;
    return next;
  }, []);

  // ── queue ops ─────────────────────────────────────────────────────────────
  const doEnqueue = useCallback(async (val, qu) => {
    const newItem = { id: uid(), value: val, state: "entering" };
    const next = [...qu, newItem];
    setQueueItems([...next]);
    queueRef.current = next;
    setQueueOp({ type: "ok", text: `enqueue(${val}) → size: ${next.length}` });
    await sleep(500);
    const settled = next.map(n => n.id === newItem.id ? { ...n, state: "idle" } : n);
    setQueueItems(settled);
    queueRef.current = settled;
    return settled;
  }, []);

  const doDequeue = useCallback(async (qu) => {
    if (!qu.length) { setQueueOp({ type: "err", text: "dequeue() → queue is empty!" }); return qu; }
    const front = qu[0];
    const marked = qu.map(n => n.id === front.id ? { ...n, state: "leaving" } : n);
    setQueueItems(marked);
    queueRef.current = marked;
    setQueueOp({ type: "out", text: `dequeue() → ${front.value} removed` });
    await sleep(500);
    const next = marked.filter(n => n.id !== front.id);
    setQueueItems(next);
    queueRef.current = next;
    return next;
  }, []);

  // ── auto demo ─────────────────────────────────────────────────────────────
  const runAutoDemo = useCallback(async () => {
    if (autoRef.current) return;
    autoRef.current = true;
    animRef.current = true;
    setAnimating(true);
    setAutoStarted(true);

    let st = [];
    let qu = [];

    // push/enqueue same values to both — show same input, different order out
    const values = [1, 2, 3, 4, 5];

    // add all
    for (const v of values) {
      [st, qu] = await Promise.all([doPush(v, st), doEnqueue(v, qu)]);
      await sleep(600);
    }
    await sleep(800);

    // pop from stack (LIFO: 5,4,3) + dequeue from queue (FIFO: 1,2,3)
    for (let i = 0; i < 3; i++) {
      [st, qu] = await Promise.all([doPop(st), doDequeue(qu)]);
      await sleep(700);
    }
    await sleep(800);

    // push/enqueue 10, 20
    [st, qu] = await Promise.all([doPush(10, st), doEnqueue(10, qu)]);
    await sleep(600);
    [st, qu] = await Promise.all([doPush(20, st), doEnqueue(20, qu)]);
    await sleep(800);

    // drain both
    while (st.length || qu.length) {
      const ops = [];
      if (st.length) ops.push(doPop(st).then(r => { st = r; }));
      if (qu.length) ops.push(doDequeue(qu).then(r => { qu = r; }));
      await Promise.all(ops);
      await sleep(650);
    }

    await sleep(400);
    setStackOp({ type: "ok", text: "// demo complete — both empty" });
    setQueueOp({ type: "ok", text: "// demo complete — both empty" });

    animRef.current = false;
    autoRef.current = false;
    setAnimating(false);
  }, [doPush, doPop, doEnqueue, doDequeue]);

  // countdown
  useEffect(() => {
    if (autoStarted) return;
    countdownRef.current = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(countdownRef.current); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [autoStarted]);

  useEffect(() => {
    if (countdown === 0 && !autoStarted) runAutoDemo();
  }, [countdown, autoStarted, runAutoDemo]);

  // ── manual ────────────────────────────────────────────────────────────────
  const stopAuto = () => {
    clearInterval(countdownRef.current);
    setAutoStarted(true);
  };

  const manualPush = async () => {
    const v = parseInt(inputVal);
    if (isNaN(v) || animRef.current) return;
    stopAuto();
    animRef.current = true; setAnimating(true);
    await doPush(v, stackRef.current);
    setInputVal("");
    animRef.current = false; setAnimating(false);
  };

  const manualPop = async () => {
    if (animRef.current) return;
    stopAuto();
    animRef.current = true; setAnimating(true);
    await doPop(stackRef.current);
    animRef.current = false; setAnimating(false);
  };

  const manualEnqueue = async () => {
    const v = parseInt(inputVal);
    if (isNaN(v) || animRef.current) return;
    stopAuto();
    animRef.current = true; setAnimating(true);
    await doEnqueue(v, queueRef.current);
    setInputVal("");
    animRef.current = false; setAnimating(false);
  };

  const manualDequeue = async () => {
    if (animRef.current) return;
    stopAuto();
    animRef.current = true; setAnimating(true);
    await doDequeue(queueRef.current);
    animRef.current = false; setAnimating(false);
  };

  const manualBoth = async (type) => {
    const v = parseInt(inputVal);
    if (type === "add" && isNaN(v)) return;
    if (animRef.current) return;
    stopAuto();
    animRef.current = true; setAnimating(true);
    if (type === "add") {
      await Promise.all([doPush(v, stackRef.current), doEnqueue(v, queueRef.current)]);
      setInputVal("");
    } else {
      await Promise.all([doPop(stackRef.current), doDequeue(queueRef.current)]);
    }
    animRef.current = false; setAnimating(false);
  };

  const reset = () => {
    clearInterval(countdownRef.current);
    animRef.current = false; autoRef.current = false;
    setAnimating(false); setAutoStarted(false); setCountdown(15);
    setStackItems([]); setQueueItems([]);
    stackRef.current = []; queueRef.current = [];
    setStackOp(null); setQueueOp(null);
    setInputVal("");
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "28px 20px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 760 }}>

        {/* Header */}
        <div style={{
          marginBottom: 22, display: "flex",
          alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 5 }}>
              // data structure visualization
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
              <span style={{ color: C.accent }}>Stack</span>
              <span style={{ color: C.muted, fontSize: 16, margin: "0 10px" }}>vs</span>
              <span style={{ color: C.purple }}>Queue</span>
            </h1>
            <div style={{ marginTop: 6, display: "flex", gap: 20, fontSize: 11, color: C.muted }}>
              <span><span style={{ color: C.accent }}>LIFO</span> — Last In, First Out</span>
              <span><span style={{ color: C.purple }}>FIFO</span> — First In, First Out</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {!autoStarted && countdown > 0 ? (
              <>
                <Countdown seconds={countdown} total={15} />
                <button onClick={() => { clearInterval(countdownRef.current); runAutoDemo(); }} style={{
                  background: "transparent", border: `1px solid ${C.yellow}66`,
                  borderRadius: 7, padding: "4px 12px", color: C.yellow,
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                }}>▶ start now</button>
              </>
            ) : (
              <div style={{ fontSize: 11, color: animating ? C.yellow : C.green }}>
                {animating ? "⏳ running..." : "✓ done"}
              </div>
            )}
          </div>
        </div>

        {/* Split panels */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14, minHeight: 340 }}>
          <StackPanel items={stackItems} lastOp={stackOp} />
          <QueuePanel items={queueItems} lastOp={queueOp} />
        </div>

        {/* Complexity comparison */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 16px", marginBottom: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0, fontSize: 10, fontFamily: "JetBrains Mono, monospace",
        }}>
          {[
            ["operation", "Stack", "Queue"],
            ["add",       "push() O(1)", "enqueue() O(1)"],
            ["remove",    "pop() O(1)", "dequeue() O(n)*"],
            ["peek",      "peek() O(1)", "front() O(1)"],
          ].map(([op, s, q], i) => (
            [
              <div key={`op-${i}`} style={{ color: C.muted, padding: "5px 8px", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>{op}</div>,
              <div key={`s-${i}`} style={{ color: i === 0 ? C.accent : C.text, padding: "5px 8px", borderLeft: `1px solid ${C.border}`, borderBottom: i < 3 ? `1px solid ${C.border}` : "none", textAlign: "center" }}>{s}</div>,
              <div key={`q-${i}`} style={{ color: i === 0 ? C.purple : i === 2 ? C.orange : C.text, padding: "5px 8px", borderLeft: `1px solid ${C.border}`, borderBottom: i < 3 ? `1px solid ${C.border}` : "none", textAlign: "center" }}>{q}</div>,
            ]
          ))}
          <div style={{ gridColumn: "1 / -1", paddingTop: 6, color: C.muted + "88", fontSize: 9 }}>
            * array.shift() — moves all elements left. Use Linked List for O(1) dequeue.
          </div>
        </div>

        {/* Manual controls */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "14px 18px",
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>// manual controls</div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: C.muted }}>value</span>
              <input type="number" value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="42" disabled={animating}
                style={{
                  width: 68, background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "7px 10px", color: C.text,
                  fontSize: 13, fontFamily: "inherit", outline: "none",
                }}
              />
            </div>

            {/* both */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: C.muted }}>both</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => manualBoth("add")} disabled={animating || !inputVal} style={btnStyle(C.green, animating || !inputVal)}>+ both</button>
                <button onClick={() => manualBoth("remove")} disabled={animating} style={btnStyle(C.red, animating)}>− both</button>
              </div>
            </div>

            <div style={{ width: 1, height: 32, background: C.border, margin: "0 4px", alignSelf: "flex-end" }} />

            {/* stack only */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: C.accent }}>stack only</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={manualPush} disabled={animating || !inputVal} style={btnStyle(C.accent, animating || !inputVal)}>push</button>
                <button onClick={manualPop} disabled={animating} style={btnStyle(C.accent, animating, true)}>pop</button>
              </div>
            </div>

            {/* queue only */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: C.purple }}>queue only</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={manualEnqueue} disabled={animating || !inputVal} style={btnStyle(C.purple, animating || !inputVal)}>enqueue</button>
                <button onClick={manualDequeue} disabled={animating} style={btnStyle(C.purple, animating, true)}>dequeue</button>
              </div>
            </div>

            <button onClick={reset} disabled={animating} style={{
              ...btnStyle(C.muted, animating, true), marginLeft: "auto", alignSelf: "flex-end",
            }}>↺ reset</button>
          </div>
        </div>

      </div>
    </div>
  );
}

function btnStyle(color, disabled, outline = false) {
  return {
    background: disabled ? C.border : outline ? "transparent" : color + "22",
    border: `1px solid ${disabled ? C.border : color}`,
    borderRadius: 7, padding: "7px 12px",
    color: disabled ? C.muted : color,
    fontSize: 11, fontWeight: outline ? 400 : 600,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "JetBrains Mono, monospace",
    transition: "all 0.2s",
  };
}
