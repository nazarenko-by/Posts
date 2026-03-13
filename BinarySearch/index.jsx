import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

const COLORS = {
  bg: "#0a0d14",
  surface: "#1a1b2e",
  surface2: "#16213e",
  border: "#2a2c4a",
  active: "#7dcfff",
  mid: "#e0af68",
  found: "#9ece6a",
  notFound: "#ff5f57",
  eliminated: "#1e2035",
  eliminatedStroke: "#2a2c4a",
  text: "#c0caf5",
  muted: "#565f89",
  purple: "#bb9af7",
};

function generateSortedArray(n = 24) {
  const set = new Set();
  while (set.size < n) set.add(Math.floor(Math.random() * 96) + 3);
  return [...set].sort((a, b) => a - b);
}

function getBinarySearchFrames(arr, target) {
  const frames = [];
  let lo = 0,
    hi = arr.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const status = arr[mid] === target ? "found" : arr[mid] < target ? "too_low" : "too_high";
    frames.push({ lo, hi, mid, status, found: arr[mid] === target ? mid : -1 });
    if (arr[mid] === target) break;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }

  if (!frames.length || frames.at(-1).found === -1) {
    frames.push({ lo: -1, hi: -1, mid: -1, status: "not_found", found: -1 });
  }
  return frames;
}

const MARGIN = { top: 24, right: 16, bottom: 36, left: 16 };

const BinarySearch = () => {
  const svgRef = useRef(null);
  const timerRef = useRef(null);
  const framesRef = useRef([]);
  const arrRef = useRef([]);

  const [arr, setArr] = useState(() => generateSortedArray(24));
  const [target, setTarget] = useState(null);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [totalFrames, setTotalFrames] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [speed, setSpeed] = useState(600);
  const [inputVal, setInputVal] = useState("");
  const [phase, setPhase] = useState("pick"); // pick | running | done

  arrRef.current = arr;

  const drawInitial = useCallback(
    (a, highlightTarget = null) => {
      const svg = d3.select(svgRef.current);
      const width = svgRef.current?.clientWidth || 560;
      const height = 280;
      const innerW = width - MARGIN.left - MARGIN.right;
      const innerH = height - MARGIN.top - MARGIN.bottom;

      svg.attr("height", height);
      svg.selectAll("*").remove();

      const g = svg
        .append("g")
        .attr("class", "main")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

      const xScale = d3
        .scaleBand()
        .domain(d3.range(a.length))
        .range([0, innerW])
        .padding(0.1);

      const yScale = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);

      // bars
      g.selectAll("rect.bar")
        .data(a)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (_, i) => xScale(i))
        .attr("width", xScale.bandwidth())
        .attr("rx", 3)
        .attr("y", (d) => yScale(d))
        .attr("height", (d) => innerH - yScale(d))
        .attr("fill", (d) =>
          highlightTarget !== null && d === highlightTarget ? COLORS.mid : COLORS.active
        );

      // value labels
      g.selectAll("text.val")
        .data(a)
        .join("text")
        .attr("class", "val")
        .attr("x", (_, i) => xScale(i) + xScale.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", a.length > 20 ? "8px" : "9px")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("fill", (d) =>
          highlightTarget !== null && d === highlightTarget ? COLORS.mid : COLORS.muted
        )
        .attr("y", (d) => yScale(d) - 4)
        .text((d) => d);

      // index labels at bottom
      g.selectAll("text.idx")
        .data(a)
        .join("text")
        .attr("class", "idx")
        .attr("x", (_, i) => xScale(i) + xScale.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "7px")
        .attr("font-family", "JetBrains Mono, monospace")
        .attr("fill", COLORS.muted)
        .attr("opacity", 0.5)
        .attr("y", innerH + 14)
        .text((_, i) => i);
    },
    []
  );

  const drawFrame = useCallback(
    (frame, a) => {
      const svg = d3.select(svgRef.current);
      const width = svgRef.current?.clientWidth || 560;
      const height = 280;
      const innerW = width - MARGIN.left - MARGIN.right;
      const innerH = height - MARGIN.top - MARGIN.bottom;

      const xScale = d3
        .scaleBand()
        .domain(d3.range(a.length))
        .range([0, innerW])
        .padding(0.1);
      const yScale = d3.scaleLinear().domain([0, 100]).range([innerH, 0]);

      const getColor = (_, i) => {
        if (frame.found !== -1 && i === frame.found) return COLORS.found;
        if (frame.status === "not_found") return COLORS.eliminated;
        if (i === frame.mid) return COLORS.mid;
        if (i >= frame.lo && i <= frame.hi) return COLORS.active;
        return COLORS.eliminated;
      };

      svg
        .select("g.main")
        .selectAll("rect.bar")
        .data(a)
        .attr("fill", getColor)
        .transition()
        .duration(speed * 0.5)
        .attr("y", (d) => yScale(d))
        .attr("height", (d) => innerH - yScale(d));

      svg
        .select("g.main")
        .selectAll("text.val")
        .data(a)
        .attr("fill", (d, i) => {
          if (frame.found !== -1 && i === frame.found) return COLORS.found;
          if (frame.status === "not_found") return COLORS.eliminatedStroke;
          if (i === frame.mid) return COLORS.mid;
          if (i >= frame.lo && i <= frame.hi) return COLORS.active;
          return COLORS.muted + "44";
        })
        .transition()
        .duration(speed * 0.5)
        .attr("y", (d) => yScale(d) - 4)
        .text((d) => d);

      // mid pointer arrow
      svg.select("g.main").selectAll("text.mid-label").remove();
      if (frame.mid !== -1 && frame.found === -1) {
        svg
          .select("g.main")
          .append("text")
          .attr("class", "mid-label")
          .attr("x", xScale(frame.mid) + xScale.bandwidth() / 2)
          .attr("y", innerH + 26)
          .attr("text-anchor", "middle")
          .attr("font-size", "9px")
          .attr("font-family", "JetBrains Mono, monospace")
          .attr("fill", COLORS.mid)
          .text("▲ mid");
      }
    },
    [speed]
  );

  useEffect(() => {
    drawInitial(arr);
  }, [arr, drawInitial]);

  const pickTarget = useCallback(
    (val) => {
      const t = Number(val);
      if (!arr.includes(t) && !isNaN(t)) {
        // pick a value that IS in array for better UX, or allow miss
      }
      setTarget(t);
      setPhase("running");
      setFrameIdx(-1);
      setIsDone(false);
      setCurrentStatus(null);

      const frames = getBinarySearchFrames(arr, t);
      framesRef.current = frames;
      setTotalFrames(frames.length);
      drawInitial(arr, t);

      // small delay then start
      setTimeout(() => {
        let i = 0;
        setIsRunning(true);
        timerRef.current = setInterval(() => {
          if (i >= frames.length) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsDone(true);
            setPhase("done");
            setCurrentStatus(frames.at(-1)?.status);
            return;
          }
          drawFrame(frames[i], arr);
          setFrameIdx(i);
          setCurrentStatus(frames[i].status);
          i++;
        }, speed);
      }, 400);
    },
    [arr, drawInitial, drawFrame, speed]
  );

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    const newArr = generateSortedArray(24);
    setArr(newArr);
    setTarget(null);
    setFrameIdx(-1);
    setTotalFrames(0);
    setIsRunning(false);
    setIsDone(false);
    setCurrentStatus(null);
    setPhase("pick");
    setInputVal("");
    drawInitial(newArr);
  }, [drawInitial]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const statusLabel = () => {
    if (!currentStatus) return null;
    const frame = framesRef.current[frameIdx];
    if (currentStatus === "found")
      return (
        <span style={{ color: COLORS.found }}>
          ✓ знайдено на індексі {frame?.mid}
        </span>
      );
    if (currentStatus === "not_found")
      return <span style={{ color: COLORS.notFound }}>✗ не знайдено</span>;
    if (currentStatus === "too_low")
      return (
        <span style={{ color: COLORS.mid }}>
          arr[mid] &lt; target → шукаємо праворуч
        </span>
      );
    if (currentStatus === "too_high")
      return (
        <span style={{ color: COLORS.mid }}>
          arr[mid] &gt; target → шукаємо ліворуч
        </span>
      );
    return null;
  };

  const progress =
    totalFrames > 0 ? Math.round(((frameIdx + 1) / totalFrames) * 100) : 0;
  const steps = frameIdx >= 0 ? frameIdx + 1 : 0;

  // pick some suggestions from the array
  const suggestions = arr.length
    ? [
        arr[Math.floor(arr.length * 0.2)],
        arr[Math.floor(arr.length * 0.5)],
        arr[Math.floor(arr.length * 0.8)],
        arr[Math.floor(arr.length * 0.1)] - 1, // one not in array
      ]
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: "'JetBrains Mono', monospace",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            color: COLORS.muted,
            fontSize: 11,
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          // D3.js algorithm visualization
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: COLORS.text }}>
          Binary Search
        </h1>
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 18,
            justifyContent: "center",
            fontSize: 11,
          }}
        >
          {[
            ["active zone", COLORS.active],
            ["mid", COLORS.mid],
            ["found", COLORS.found],
            ["eliminated", "#3a3d5a"],
          ].map(([label, color]) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: color,
                  border: label === "eliminated" ? `1px solid ${COLORS.border}` : "none",
                }}
              />
              <span style={{ color: COLORS.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: "20px 16px 16px",
        }}
      >
        <svg ref={svgRef} style={{ width: "100%", overflow: "visible" }} />

        {/* Status line */}
        <div
          style={{
            minHeight: 20,
            marginTop: 8,
            fontSize: 11,
            color: COLORS.muted,
            textAlign: "center",
          }}
        >
          {phase === "pick" && (
            <span style={{ color: COLORS.muted }}>
              ↓ обери число для пошуку
            </span>
          )}
          {phase !== "pick" && statusLabel()}
        </div>

        {/* Progress bar */}
        {phase !== "pick" && (
          <>
            <div
              style={{
                marginTop: 10,
                height: 3,
                background: COLORS.border,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background:
                    currentStatus === "found"
                      ? COLORS.found
                      : currentStatus === "not_found"
                      ? COLORS.notFound
                      : COLORS.purple,
                  borderRadius: 2,
                  transition: "width 0.15s",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
                fontSize: 10,
                color: COLORS.muted,
              }}
            >
              <span>
                крок {steps} / {totalFrames}
              </span>
              <span>
                {isDone
                  ? currentStatus === "found"
                    ? `✓ за ${steps} кроків`
                    : "✗ не знайдено"
                  : `~${Math.ceil(Math.log2(arr.length))} макс`}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Target picker */}
      {phase === "pick" && (
        <div
          style={{
            marginTop: 20,
            width: "100%",
            maxWidth: 600,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: "18px 20px",
          }}
        >
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 12 }}>
            // Select a search target:
          </div>

          {/* Suggestions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {suggestions.map((s, i) => {
              const inArr = arr.includes(s);
              return (
                <button
                  key={i}
                  onClick={() => pickTarget(s)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${inArr ? COLORS.active + "88" : COLORS.border}`,
                    borderRadius: 7,
                    padding: "6px 14px",
                    color: inArr ? COLORS.active : COLORS.muted,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    position: "relative",
                  }}
                >
                  {s}
                  {!inArr && (
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -4,
                        fontSize: 8,
                        color: COLORS.notFound,
                        background: COLORS.surface,
                        padding: "1px 3px",
                        borderRadius: 3,
                      }}
                    >
                      miss
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Manual input */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inputVal && pickTarget(inputVal)}
              placeholder="or enter your number..."
              style={{
                flex: 1,
                background: COLORS.surface2,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: "8px 12px",
                color: COLORS.text,
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              onClick={() => inputVal && pickTarget(inputVal)}
              disabled={!inputVal}
              style={{
                background: inputVal ? COLORS.purple : COLORS.border,
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                color: inputVal ? COLORS.bg : COLORS.muted,
                fontSize: 13,
                fontWeight: 700,
                cursor: inputVal ? "pointer" : "not-allowed",
                fontFamily: "inherit",
              }}
            >
              search
            </button>
          </div>
        </div>
      )}

      {/* Done state controls */}
      {phase === "done" && (
        <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center" }}>
          <button
            onClick={() => {
              setPhase("pick");
              setFrameIdx(-1);
              setTotalFrames(0);
              setCurrentStatus(null);
              setIsDone(false);
              setInputVal("");
              drawInitial(arr);
            }}
            style={{
              background: COLORS.purple,
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              color: COLORS.bg,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🔍 find more
          </button>
          <button
            onClick={reset}
            style={{
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "10px 18px",
              color: COLORS.muted,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ↺ new array
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 6 }}>
            <span style={{ fontSize: 11, color: COLORS.muted }}>speed</span>
            {[
              ["slow", 900],
              ["mid", 600],
              ["fast", 250],
            ].map(([label, val]) => (
              <button
                key={label}
                onClick={() => setSpeed(val)}
                style={{
                  background: speed === val ? COLORS.border : "transparent",
                  border: `1px solid ${speed === val ? COLORS.purple : COLORS.border}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  color: speed === val ? COLORS.purple : COLORS.muted,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info footer */}
      <div
        style={{
          marginTop: 22,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: "10px 18px",
          fontSize: 11,
          color: COLORS.muted,
          maxWidth: 600,
          width: "100%",
          display: "flex",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        <span>
          <span style={{ color: COLORS.purple }}>O(log n)</span> · n ={" "}
          {arr.length}
        </span>
        <span>
          max steps:{" "}
          <span style={{ color: COLORS.mid }}>
            {Math.ceil(Math.log2(arr.length))}
          </span>
        </span>
        <span>
          array was sorted:{" "}
          <span style={{ color: COLORS.found }}>✓</span>
        </span>
      </div>
    </div>
  );
}

export default BinarySearch