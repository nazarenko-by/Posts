import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14",
  surface: "#1a1b2e",
  surface2: "#16213e",
  border: "#2a2c4a",
  text: "#c0caf5",
  muted: "#565f89",
  divide: "#7dcfff",   // blue — splitting phase
  merge:  "#9ece6a",   // green — merging phase
  active: "#e0af68",   // yellow — currently processing
  sorted: "#bb9af7",   // purple — fully sorted
  compare:"#ff9e64",   // orange — comparing two elements
};

// ─── build the full recursion tree ───────────────────────────────────────────
// returns a flat list of "frames" each frame = snapshot of all nodes
// node: { id, arr, level, x, y, state, parentId, side }

let nodeId = 0;
function buildTree(arr) {
  nodeId = 0;
  const nodes = [];
  const frames = [];

  function divide(arr, level, parentId, side) {
    const id = ++nodeId;
    const node = { id, arr: [...arr], level, parentId, side, state: "idle" };
    nodes.push(node);

    if (arr.length <= 1) {
      return { id, sorted: [...arr] };
    }

    const mid = Math.floor(arr.length / 2);
    const leftResult  = divide(arr.slice(0, mid), level + 1, id, "left");
    const rightResult = divide(arr.slice(mid),    level + 1, id, "right");

    // merge step
    const merged = [];
    let l = 0, r = 0;
    const left = leftResult.sorted, right = rightResult.sorted;
    while (l < left.length && r < right.length) {
      if (left[l] <= right[r]) merged.push(left[l++]);
      else merged.push(right[r++]);
    }
    const sorted = [...merged, ...left.slice(l), ...right.slice(r)];
    node.sorted = sorted;
    node.leftId = leftResult.id;
    node.rightId = rightResult.id;
    return { id, sorted };
  }

  divide(arr, 0, null, "root");
  return nodes;
}

// assign x positions by level using in-order traversal
function layoutTree(nodes) {
  // build a map
  const map = {};
  nodes.forEach(n => { map[n.id] = n; });

  // find leaves per level, assign x by in-order of leaves
  const maxLevel = Math.max(...nodes.map(n => n.level));
  const levelCounts = {};
  nodes.forEach(n => {
    levelCounts[n.level] = (levelCounts[n.level] || 0) + 1;
  });

  // use leaf positions to define x
  const leaves = nodes.filter(n => n.arr.length === 1);
  const leafCount = leaves.length;

  // assign leaf x positions left to right (in-order)
  function assignX(nodeId, counter = { v: 0 }) {
    const n = map[nodeId];
    if (!n) return;
    if (n.leftId) assignX(n.leftId, counter);
    if (!n.leftId && !n.rightId) {
      n.xIdx = counter.v++;
    } else {
      // parent x = midpoint of children
    }
    if (n.rightId) assignX(n.rightId, counter);
    if (n.leftId && n.rightId) {
      n.xIdx = (map[n.leftId].xIdx + map[n.rightId].xIdx) / 2;
    } else if (n.leftId) {
      n.xIdx = map[n.leftId].xIdx;
    }
  }

  const root = nodes.find(n => n.parentId === null);
  if (root) assignX(root.id);

  return { map, leafCount, maxLevel };
}

// ─── build animation frames ───────────────────────────────────────────────────
function buildFrames(nodes, map) {
  const frames = [];
  const states = {};
  nodes.forEach(n => { states[n.id] = "idle"; });

  const snap = (highlight = {}) => {
    const s = { ...states, ...highlight };
    frames.push({ states: { ...s } });
  };

  // PHASE 1: divide — top-down BFS reveal
  const root = nodes.find(n => n.parentId === null);
  const levels = {};
  nodes.forEach(n => {
    if (!levels[n.level]) levels[n.level] = [];
    levels[n.level].push(n);
  });

  const maxLevel = Math.max(...nodes.map(n => n.level));
  for (let lv = 0; lv <= maxLevel; lv++) {
    const levelNodes = levels[lv] || [];
    const hl = {};
    levelNodes.forEach(n => {
      states[n.id] = n.arr.length === 1 ? "base" : "dividing";
      hl[n.id] = states[n.id];
    });
    snap(hl);
  }

  snap();

  // PHASE 2: merge — bottom-up
  function mergeOrder(nodeId) {
    const n = map[nodeId];
    if (!n) return;
    if (n.leftId) mergeOrder(n.leftId);
    if (n.rightId) mergeOrder(n.rightId);

    if (n.leftId || n.rightId) {
      // highlight children as "active"
      const hl1 = {};
      if (n.leftId)  hl1[n.leftId]  = "active";
      if (n.rightId) hl1[n.rightId] = "active";
      snap(hl1);

      // mark self as merging
      states[n.id] = "merging";
      const hl2 = { ...hl1 };
      hl2[n.id] = "merging";
      snap(hl2);

      // mark self as sorted, children as done
      states[n.id] = "sorted";
      const hl3 = { [n.id]: "sorted" };
      if (n.leftId)  { states[n.leftId]  = "done"; hl3[n.leftId]  = "done"; }
      if (n.rightId) { states[n.rightId] = "done"; hl3[n.rightId] = "done"; }
      snap(hl3);
    }
  }

  if (root) mergeOrder(root.id);
  return frames;
}

// ─── Node box ─────────────────────────────────────────────────────────────────
function NodeBox({ node, state, x, y, boxW, boxH, isRoot }) {
  const stateStyle = {
    idle:     { bg: C.surface2,     border: C.border,   text: C.muted   },
    dividing: { bg: "#0d1e2e",      border: C.divide,   text: C.divide  },
    base:     { bg: "#0d1e1a",      border: C.merge,    text: C.merge   },
    active:   { bg: "#1e1a0d",      border: C.active,   text: C.active  },
    merging:  { bg: "#1a1e0d",      border: C.active,   text: C.active  },
    sorted:   { bg: "#160d2e",      border: C.sorted,   text: C.sorted  },
    done:     { bg: C.surface2,     border: C.border,   text: C.muted + "88" },
  };

  const s = stateStyle[state] || stateStyle.idle;
  const glowing = ["dividing","base","active","merging","sorted"].includes(state);

  return (
    <g transform={`translate(${x - boxW / 2}, ${y})`}>
      <rect
        width={boxW} height={boxH} rx={6}
        fill={s.bg}
        stroke={s.border}
        strokeWidth={glowing ? 1.5 : 1}
        style={{
          filter: glowing ? `drop-shadow(0 0 6px ${s.border}99)` : "none",
          transition: "all 0.3s ease",
        }}
      />
      {/* value chips */}
      {node.arr.map((v, i) => {
        const chipW = Math.min(22, (boxW - 8) / node.arr.length - 2);
        const chipX = 4 + i * (chipW + 2);
        const displayArr = state === "sorted" || state === "done" ? (node.sorted || node.arr) : node.arr;
        const val = displayArr[i] ?? node.arr[i];
        return (
          <g key={i}>
            <rect x={chipX} y={4} width={chipW} height={boxH - 8} rx={3}
              fill={s.border + "22"} />
            <text
              x={chipX + chipW / 2} y={boxH / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={node.arr.length > 4 ? 9 : 11}
              fontWeight={700}
              fontFamily="JetBrains Mono, monospace"
              fill={s.text}
            >{val}</text>
          </g>
        );
      })}
      {/* state badge */}
      {state === "dividing" && (
        <text x={boxW / 2} y={boxH + 11} textAnchor="middle"
          fontSize={8} fontFamily="JetBrains Mono, monospace" fill={C.divide} opacity={0.8}>
          split ↓
        </text>
      )}
      {state === "merging" && (
        <text x={boxW / 2} y={boxH + 11} textAnchor="middle"
          fontSize={8} fontFamily="JetBrains Mono, monospace" fill={C.active} opacity={0.9}>
          merging…
        </text>
      )}
      {(state === "sorted" && isRoot) && (
        <text x={boxW / 2} y={boxH + 11} textAnchor="middle"
          fontSize={8} fontFamily="JetBrains Mono, monospace" fill={C.sorted} opacity={0.9}>
          ✓ sorted
        </text>
      )}
    </g>
  );
}

// ─── SVG tree ─────────────────────────────────────────────────────────────────
function TreeSVG({ nodes, map, leafCount, maxLevel, frameStates, svgW }) {
  const BOX_H = 32;
  const LEVEL_H = 80;
  const svgH = (maxLevel + 1) * LEVEL_H + BOX_H + 30;

  const getBoxW = (arr) => Math.max(arr.length * 26 + 8, 36);

  const toX = (xIdx) => 28 + (xIdx / (leafCount - 1 || 1)) * (svgW - 56);
  const toY = (level) => 10 + level * LEVEL_H;

  const root = nodes.find(n => n.parentId === null);

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ overflow: "visible", display: "block" }}>

      {/* connector lines */}
      {nodes.map(n => {
        if (!n.parentId) return null;
        const parent = map[n.parentId];
        const px = toX(parent.xIdx), py = toY(parent.level) + BOX_H;
        const cx = toX(n.xIdx),     cy = toY(n.level);
        const state = frameStates[n.id] || "idle";
        const pstate = frameStates[n.parentId] || "idle";
        const active = ["dividing","base","active","merging","sorted"].includes(state);
        const color = state === "done" ? C.border :
                      state === "sorted" ? C.sorted :
                      ["active","merging"].includes(state) ? C.active :
                      state === "dividing" ? C.divide :
                      state === "base" ? C.merge : C.border;
        return (
          <line key={`line-${n.id}`}
            x1={px} y1={py} x2={cx} y2={cy}
            stroke={color}
            strokeWidth={active ? 1.5 : 0.8}
            opacity={active ? 0.8 : 0.3}
            style={{ transition: "all 0.35s ease" }}
          />
        );
      })}

      {/* nodes */}
      {nodes.map(n => {
        const x = toX(n.xIdx);
        const y = toY(n.level);
        const bw = getBoxW(n.arr);
        const state = frameStates[n.id] || "idle";
        return (
          <NodeBox key={n.id} node={n} state={state}
            x={x} y={y} boxW={bw} boxH={BOX_H}
            isRoot={n.id === root?.id}
          />
        );
      })}
    </svg>
  );
}

// ─── Countdown ring ───────────────────────────────────────────────────────────
function Ring({ val, total, color }) {
  const r = 13, c = 2 * Math.PI * r;
  return (
    <svg width={34} height={34} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={17} cy={17} r={r} fill="none" stroke={C.border} strokeWidth={2} />
      <circle cx={17} cy={17} r={r} fill="none" stroke={color} strokeWidth={2}
        strokeDasharray={c} strokeDashoffset={c * (1 - val / total)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear" }} />
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const PRESETS = {
  small:  [8, 3, 5, 1, 9, 2, 7, 4],
  medium: [6, 2, 9, 4, 7, 1, 8, 3, 5, 10, 12, 11],
  random: () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 19) + 1),
};

export default function MergeSortViz() {
  const [arr, setArr] = useState(PRESETS.medium);
  const [nodes, setNodes] = useState([]);
  const [map, setMap]   = useState({});
  const [leafCount, setLeafCount] = useState(1);
  const [maxLevel, setMaxLevel]   = useState(0);
  const [frames, setFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | divide | merge | done
  const [speed, setSpeed] = useState(500);
  const [countdown, setCountdown] = useState(15);
  const [autoStarted, setAutoStarted] = useState(false);
  const [svgW, setSvgW] = useState(640);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const cdRef    = useRef(null);

  // measure container width
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width;
      if (w) setSvgW(Math.max(w - 8, 300));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // build tree whenever arr changes
  useEffect(() => {
    const ns = buildTree(arr);
    const { map: m, leafCount: lc, maxLevel: ml } = layoutTree(ns);
    const fr = buildFrames(ns, m);
    setNodes(ns);
    setMap(m);
    setLeafCount(lc);
    setMaxLevel(ml);
    setFrames(fr);
    setFrameIdx(0);
    setPhase("idle");
    setPlaying(false);
    clearInterval(timerRef.current);
  }, [arr]);

  // current frame states
  const frameStates = frames[frameIdx]?.states || {};

  // determine phase label from frameIdx
  const phaseLabel = () => {
    if (!frames.length || frameIdx === 0) return "idle";
    const divideFrames = nodes.length; // rough split
    if (frameIdx <= maxLevel + 1) return "divide";
    if (frameIdx >= frames.length - 1) return "done";
    return "merge";
  };

  // play/pause
  const play = useCallback(() => {
    if (frameIdx >= frames.length - 1) {
      setFrameIdx(0);
    }
    setPlaying(true);
  }, [frameIdx, frames.length]);

  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setFrameIdx(p => {
        if (p >= frames.length - 1) {
          setPlaying(false);
          setPhase("done");
          clearInterval(timerRef.current);
          return p;
        }
        return p + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, frames.length]);

  // countdown
  useEffect(() => {
    if (autoStarted) return;
    cdRef.current = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(cdRef.current); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(cdRef.current);
  }, [autoStarted]);

  useEffect(() => {
    if (countdown === 0 && !autoStarted) {
      setAutoStarted(true);
      play();
    }
  }, [countdown, autoStarted, play]);

  const stopCd = () => { clearInterval(cdRef.current); setAutoStarted(true); };

  const reset = () => {
    clearInterval(timerRef.current);
    clearInterval(cdRef.current);
    setFrameIdx(0);
    setPlaying(false);
    setPhase("idle");
    setAutoStarted(false);
    setCountdown(15);
  };

  const currentPhase = (() => {
    if (!frames.length || frameIdx === 0) return "idle";
    if (frameIdx >= frames.length - 1) return "done";
    // divide phase = frames where only "dividing"/"base" states appear
    const s = frames[frameIdx]?.states || {};
    const vals = Object.values(s);
    if (vals.some(v => ["merging","sorted","active"].includes(v))) return "merge";
    return "divide";
  })();

  const phaseColor = { idle: C.muted, divide: C.divide, merge: C.merge, done: C.sorted };
  const phaseDesc  = {
    idle:   "ready — press play",
    divide: "phase 1: divide  — splitting array recursively",
    merge:  "phase 2: merge   — combining sorted halves",
    done:   "✓ sorted — divide and conquer complete",
  };

  const progress = frames.length > 1 ? Math.round((frameIdx / (frames.length - 1)) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "JetBrains Mono, monospace",
      padding: "24px 16px", boxSizing: "border-box",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 720 }}>

        {/* Header */}
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 4 }}>
              // divide and conquer
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
              Merge Sort
            </h1>
            <div style={{ marginTop: 6, display: "flex", gap: 16, fontSize: 11 }}>
              <span><span style={{ color: C.divide }}>■</span> divide</span>
              <span><span style={{ color: C.merge  }}>■</span> merge</span>
              <span><span style={{ color: C.active }}>■</span> active</span>
              <span><span style={{ color: C.sorted }}>■</span> sorted</span>
            </div>
          </div>

          {/* countdown */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            {!autoStarted && countdown > 0 ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Ring val={countdown} total={15} color={C.divide} />
                  <span style={{ fontSize: 12, color: C.divide }}>auto in {countdown}s</span>
                </div>
                <button onClick={() => { stopCd(); play(); }} style={{
                  background: "transparent", border: `1px solid ${C.divide}66`,
                  borderRadius: 7, padding: "4px 12px", color: C.divide,
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                }}>▶ start now</button>
              </>
            ) : (
              <div style={{ fontSize: 11, color: phaseColor[currentPhase] || C.muted }}>
                {playing ? "⏳ running..." : phaseDesc[currentPhase]}
              </div>
            )}
          </div>
        </div>

        {/* Phase bar */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: "10px 16px", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{
            fontSize: 12, color: phaseColor[currentPhase],
            minWidth: 200, transition: "color 0.3s",
          }}>
            {phaseDesc[currentPhase]}
          </span>
          <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: currentPhase === "divide" ? C.divide :
                          currentPhase === "merge"  ? C.merge  :
                          currentPhase === "done"   ? C.sorted : C.muted,
              borderRadius: 2,
              transition: "width 0.15s, background 0.3s",
            }} />
          </div>
          <span style={{ fontSize: 10, color: C.muted, minWidth: 40, textAlign: "right" }}>{progress}%</span>
        </div>

        {/* Tree */}
        <div ref={containerRef} style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: "16px 8px",
          marginBottom: 14, overflowX: "auto", overflowY: "hidden",
        }}>
          {nodes.length > 0 && (
            <TreeSVG
              nodes={nodes} map={map}
              leafCount={leafCount} maxLevel={maxLevel}
              frameStates={frameStates}
              svgW={svgW}
            />
          )}
        </div>

        {/* Controls */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "14px 18px", marginBottom: 14,
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

            {/* play/pause */}
            <button onClick={() => { stopCd(); playing ? setPlaying(false) : play(); }} style={{
              background: playing ? C.surface2 : C.divide,
              border: `1px solid ${playing ? C.border : C.divide}`,
              borderRadius: 8, padding: "8px 20px",
              color: playing ? C.muted : C.bg,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: !playing ? `0 0 12px ${C.divide}44` : "none",
              transition: "all 0.2s",
            }}>
              {playing ? "⏸ pause" : frameIdx >= frames.length - 1 ? "↺ replay" : "▶ play"}
            </button>

            {/* step buttons */}
            <button onClick={() => { stopCd(); setFrameIdx(p => Math.max(0, p - 1)); }}
              disabled={playing || frameIdx === 0}
              style={stepBtn(playing || frameIdx === 0)}>← step</button>
            <button onClick={() => { stopCd(); setFrameIdx(p => Math.min(frames.length - 1, p + 1)); }}
              disabled={playing || frameIdx >= frames.length - 1}
              style={stepBtn(playing || frameIdx >= frames.length - 1)}>step →</button>

            <button onClick={reset} style={stepBtn(false)}>↺ reset</button>

            {/* speed */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              <span style={{ fontSize: 10, color: C.muted }}>speed</span>
              {[["slow", 900], ["mid", 500], ["fast", 200]].map(([lbl, ms]) => (
                <button key={lbl} onClick={() => setSpeed(ms)} style={{
                  background: speed === ms ? C.border : "transparent",
                  border: `1px solid ${speed === ms ? C.divide : C.border}`,
                  borderRadius: 6, padding: "4px 10px",
                  color: speed === ms ? C.divide : C.muted,
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Array presets */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "12px 18px",
        }}>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>// input array</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => { reset(); setArr(PRESETS.small); }} style={presetBtn(JSON.stringify(arr) === JSON.stringify(PRESETS.small))}>
              [8,3,5,1,9,2,7,4]
            </button>
            <button onClick={() => { reset(); setArr(PRESETS.medium); }} style={presetBtn(arr.length === 12)}>
              12 elements
            </button>
            <button onClick={() => { reset(); setArr(PRESETS.random()); }} style={presetBtn(false)}>
              ↺ random 8
            </button>

            {/* current array display */}
            <div style={{
              marginLeft: "auto", display: "flex", gap: 4, alignItems: "center",
            }}>
              {arr.map((v, i) => (
                <div key={i} style={{
                  width: 26, height: 26, borderRadius: 5,
                  background: C.surface2, border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: C.text,
                }}>{v}</div>
              ))}
            </div>
          </div>

          {/* frame info */}
          <div style={{ marginTop: 10, fontSize: 10, color: C.muted }}>
            frame {frameIdx} / {frames.length - 1}
            {" · "}levels: {maxLevel + 1}
            {" · "}O(n log n) = {arr.length} × {Math.ceil(Math.log2(arr.length))} = {arr.length * Math.ceil(Math.log2(arr.length))} ops
          </div>
        </div>

      </div>
    </div>
  );
}

function stepBtn(disabled) {
  return {
    background: "transparent",
    border: `1px solid ${disabled ? C.border : C.border}`,
    borderRadius: 7, padding: "8px 14px",
    color: disabled ? C.muted + "55" : C.muted,
    fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "JetBrains Mono, monospace",
    transition: "all 0.15s",
  };
}

function presetBtn(active) {
  return {
    background: active ? C.divide + "22" : "transparent",
    border: `1px solid ${active ? C.divide : C.border}`,
    borderRadius: 7, padding: "5px 13px",
    color: active ? C.divide : C.muted,
    fontSize: 11, cursor: "pointer",
    fontFamily: "JetBrains Mono, monospace",
    transition: "all 0.2s",
  };
}
