import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a", accent: "#7dcfff", purple: "#bb9af7",
  green: "#9ece6a", orange: "#ff9e64", yellow: "#e0af68",
  muted: "#565f89", text: "#c0caf5", red: "#ff5f57",
};

const PALETTES = {
  rect:   [C.accent, C.purple, C.green, C.orange, C.yellow],
  circle: [C.purple, C.accent, C.red,   C.yellow, C.green],
  star:   [C.yellow, C.orange, C.purple, C.accent, C.green],
};

// ─── SVG Demo ─────────────────────────────────────────────────────────────────
function SvgDemo() {
  const [fillIdx, setFillIdx] = useState({ rect: 0, circle: 0, star: 0 });
  const [activeShape, setActiveShape] = useState(null);
  const [labelOverride, setLabelOverride] = useState({});
  const [ripples, setRipples] = useState([]);

  const addRipple = (cx, cy, color) => {
    const id = Date.now() + Math.random();
    setRipples(r => [...r, { id, cx, cy, color }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700);
  };

  const starPoints = (cx, cy, r, n = 5) => {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const rad = r * (i % 2 === 0 ? 1 : 0.4);
      const angle = (Math.PI / n) * i - Math.PI / 2;
      pts.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`);
    }
    return pts.join(" ");
  };

  const handleClick = (id, cx, cy) => {
    const next = (fillIdx[id] + 1) % PALETTES[id].length;
    const newColor = PALETTES[id][next];
    setFillIdx(f => ({ ...f, [id]: next }));
    setActiveShape(id);
    addRipple(cx, cy, newColor);
    setLabelOverride(l => ({ ...l, [id]: `fill="${newColor}"` }));
    setTimeout(() => {
      setActiveShape(null);
      setLabelOverride(l => ({ ...l, [id]: null }));
    }, 1200);
  };

  return (
    <div>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.6 }}>
        Натискай на фігури — кожна змінює колір через setAttribute ↓
      </p>
      <div style={{ background: C.surface2, borderRadius: 10, padding: 4, position: "relative" }}>
        <span style={{ position: "absolute", top: 10, right: 12, fontSize: 10, color: C.muted, pointerEvents: "none", zIndex: 1 }}>
          click to cycle color
        </span>
        <svg viewBox="0 0 340 200" width="100%" style={{ display: "block" }}>
          {/* grid */}
          {[0,1,2,3,4].map(i => (
            <line key={`h${i}`} x1={0} y1={i*47} x2={340} y2={i*47} stroke={C.border} strokeWidth={0.5} />
          ))}
          {[0,1,2,3,4,5,6,7].map(i => (
            <line key={`v${i}`} x1={i*49} y1={0} x2={i*49} y2={200} stroke={C.border} strokeWidth={0.5} />
          ))}

          {/* rect */}
          <g style={{ cursor: "pointer" }} onClick={() => handleClick("rect", 64, 57)}>
            <rect x={20} y={30} width={88} height={54} rx={6}
              fill={PALETTES.rect[fillIdx.rect]}
              stroke={activeShape === "rect" ? "#fff" : "transparent"}
              strokeWidth={2}
              style={{ transition: "fill .35s ease" }}
            />
          </g>
          <text x={64} y={104} textAnchor="middle" fontSize={9}
            fill={activeShape === "rect" ? PALETTES.rect[fillIdx.rect] : C.muted}
            fontFamily="JetBrains Mono,monospace"
            style={{ transition: "fill .3s" }}>
            {labelOverride.rect || "<rect>"}
          </text>

          {/* circle */}
          <g style={{ cursor: "pointer" }} onClick={() => handleClick("circle", 175, 70)}>
            <circle cx={175} cy={70} r={47}
              fill={PALETTES.circle[fillIdx.circle]}
              stroke={activeShape === "circle" ? "#fff" : "transparent"}
              strokeWidth={2}
              style={{ transition: "fill .35s ease" }}
            />
          </g>
          <text x={175} y={136} textAnchor="middle" fontSize={9}
            fill={activeShape === "circle" ? PALETTES.circle[fillIdx.circle] : C.muted}
            fontFamily="JetBrains Mono,monospace"
            style={{ transition: "fill .3s" }}>
            {labelOverride.circle || "<circle>"}
          </text>

          {/* star */}
          <g style={{ cursor: "pointer" }} onClick={() => handleClick("star", 282, 72)}>
            <polygon
              points={starPoints(282, 72, 44)}
              fill={PALETTES.star[fillIdx.star]}
              stroke={activeShape === "star" ? "#fff" : "transparent"}
              strokeWidth={2}
              style={{ transition: "fill .35s ease" }}
            />
          </g>
          <text x={282} y={136} textAnchor="middle" fontSize={9}
            fill={activeShape === "star" ? PALETTES.star[fillIdx.star] : C.muted}
            fontFamily="JetBrains Mono,monospace"
            style={{ transition: "fill .3s" }}>
            {labelOverride.star || "<polygon>"}
          </text>

          {/* ripples */}
          {ripples.map(r => (
            <circle key={r.id} cx={r.cx} cy={r.cy} r={6} fill="none"
              stroke={r.color} strokeWidth={1.5}
              style={{ animation: "ripple .7s ease-out forwards" }}
            />
          ))}

          <text x={10} y={188} fontSize={9} fill={C.green} fontFamily="JetBrains Mono,monospace">
            ✓ DOM — кожен елемент знайдеш у DevTools
          </text>
        </svg>
        <style>{`@keyframes ripple{0%{r:4;opacity:.8}100%{r:38;opacity:0}}`}</style>
      </div>
    </div>
  );
}

// ─── Canvas particles demo ─────────────────────────────────────────────────────
function CanvasDemo() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ running: true, fc: 0, pts: [] });
  const rafRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [fc, setFc] = useState(0);
  const W = 480, H = 220;
  const COLORS = [C.accent, C.purple, C.green, C.orange, C.yellow, C.red];

  useEffect(() => {
    stateRef.current.pts = Array.from({ length: 32 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * 2.2, vy: (Math.random() - .5) * 2.2,
      r: 3 + Math.random() * 9,
      color: COLORS[i % COLORS.length],
      alpha: .45 + Math.random() * .55,
      trail: [],
    }));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = C.surface2;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.border; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(0, i * 44); ctx.lineTo(W, i * 44); ctx.stroke(); }
    for (let i = 0; i <= 11; i++) { ctx.beginPath(); ctx.moveTo(i * 44, 0); ctx.lineTo(i * 44, H); ctx.stroke(); }

    stateRef.current.pts.forEach(p => {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 10) p.trail.shift();
      p.trail.forEach((t, i) => {
        ctx.globalAlpha = (i / p.trail.length) * p.alpha * 0.3;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(t.x, t.y, p.r * (i / p.trail.length) * .7, 0, Math.PI * 2); ctx.fill();
      });
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    stateRef.current.fc++;
    ctx.font = "9px 'JetBrains Mono',monospace";
    ctx.fillStyle = C.green;
    ctx.fillText(`frame #${stateRef.current.fc} — ctx.clearRect() → всі пікселі скинуто`, 8, H - 8);
    if (stateRef.current.fc % 6 === 0) setFc(stateRef.current.fc);
    if (stateRef.current.running) rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    stateRef.current.running = running;
    if (running) { rafRef.current = requestAnimationFrame(draw); }
    else { cancelAnimationFrame(rafRef.current); }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, draw]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, margin: 0 }}>
          Кожен кадр — повний перемалювання. Фігури не зберігаються.
        </p>
        <button onClick={() => setRunning(r => !r)} style={{
          background: "transparent",
          border: `1px solid ${running ? C.border : C.green + "66"}`,
          borderRadius: 6, padding: "4px 12px",
          color: running ? C.orange : C.green,
          fontSize: 11, cursor: "pointer", fontFamily: "inherit",
          transition: "all .2s",
        }}>
          {running ? "⏸ pause" : "▶ play"}
        </button>
      </div>
      <div style={{ background: C.surface2, borderRadius: 10, padding: 4 }}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ display: "block", width: "100%", borderRadius: 8 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {[
          { label: "frame:", val: fc, color: C.yellow },
          { label: "particles:", val: 32, color: C.purple },
        ].map(({ label, val, color }) => (
          <span key={label} style={{ background: C.surface2, borderRadius: 6, padding: "4px 10px", fontSize: 11 }}>
            {label} <span style={{ color }}>{val}</span>
          </span>
        ))}
        <span style={{ background: C.surface2, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.red }}>
          el.getAttribute → ❌
        </span>
      </div>
    </div>
  );
}

// ─── Coord demo ───────────────────────────────────────────────────────────────
function CoordDemo() {
  const canvasRef = useRef(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [rot, setRot] = useState(0);
  const W = 480, H = 260;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = C.surface2; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.border; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(0, i * 43); ctx.lineTo(W, i * 43); ctx.stroke(); }
    for (let i = 0; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(i * 40, 0); ctx.lineTo(i * 40, H); ctx.stroke(); }

    [[0,0,C.accent],[W-28,0,C.orange],[0,H-28,C.green],[W-28,H-28,C.yellow]].forEach(([x,y,col]) => {
      ctx.fillStyle = col+"44"; ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.fillRect(x,y,28,28); ctx.strokeRect(x,y,28,28);
    });

    ctx.font = "10px 'JetBrains Mono',monospace"; ctx.fillStyle = C.muted;
    ctx.fillText("(0,0)", 3, 12); ctx.fillText("x →", W-28, 12); ctx.fillText("y ↓", 3, H-4);

    ctx.strokeStyle = C.muted+"55"; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(W/2+tx, 0); ctx.lineTo(W/2+tx, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H/2+ty); ctx.lineTo(W, H/2+ty); ctx.stroke();
    ctx.setLineDash([]);

    ctx.save();
    ctx.translate(W/2+tx, H/2+ty);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.fillStyle = C.purple+"40"; ctx.strokeStyle = C.purple; ctx.lineWidth = 1.5;
    ctx.fillRect(-36,-22,72,44); ctx.strokeRect(-36,-22,72,44);
    ctx.strokeStyle = C.accent+"cc"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(30,0); ctx.stroke();
    ctx.strokeStyle = C.orange+"cc";
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,22); ctx.stroke();
    ctx.fillStyle = C.purple;
    ctx.beginPath(); ctx.arc(0,0,3.5,0,Math.PI*2); ctx.fill();
    ctx.restore();

    ctx.font = "9px 'JetBrains Mono',monospace"; ctx.fillStyle = C.purple;
    ctx.fillText(`translate(${Math.round(W/2+tx)}, ${Math.round(H/2+ty)})  rotate(${rot}°)`, 8, H-8);
  }, [tx, ty, rot]);

  const sliderRow = (label, val, set, min, max, suffix) => (
    <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: C.muted, minWidth: 90, flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step={1} value={val}
        onChange={e => set(Number(e.target.value))}
        style={{ flex: 1, accentColor: C.purple }} />
      <span style={{ fontSize: 11, color: C.orange, minWidth: 44, textAlign: "right", flexShrink: 0 }}>
        {val}{suffix}
      </span>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.6 }}>
        (0,0) = лівий верхній кут. Переміщуй origin через translate:
      </p>
      <div style={{ background: C.surface2, borderRadius: 10, padding: 4, marginBottom: 14 }}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ display: "block", width: "100%", borderRadius: 8 }} />
      </div>
      {sliderRow("translate X", tx, setTx, -120, 120, "px")}
      {sliderRow("translate Y", ty, setTy, -80,  80,  "px")}
      {sliderRow("rotate",      rot, setRot, -180, 180, "°")}
    </div>
  );
}

// ─── Syntax highlight helpers ─────────────────────────────────────────────────
const Kw = ({ c }) => <span style={{ color: C.purple }}>{c}</span>;
const Ac = ({ c }) => <span style={{ color: C.accent }}>{c}</span>;
const Val = ({ c }) => <span style={{ color: C.green }}>{c}</span>;
const Cm = ({ c }) => <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>;
const Nm = ({ c }) => <span style={{ color: C.orange }}>{c}</span>;

function CodeBox({ children }) {
  return (
    <div style={{
      background: C.surface2, borderRadius: 8, padding: "12px 16px",
      fontSize: 12, lineHeight: 1.9, borderLeft: `2px solid ${C.border}`,
      marginTop: 12, fontFamily: "'JetBrains Mono','Fira Code',monospace",
      overflowX: "auto",
    }}>
      {children}
    </div>
  );
}

function ProsCons({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
      {items.map(({ color, title, rows }) => (
        <div key={title} style={{ background: color + "0d", border: `1px solid ${color}33`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 8 }}>{title}</div>
          {rows.map((row, i) => (
            <div key={i} style={{ fontSize: 11, color: C.text, lineHeight: 2.1 }}>• {row}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "svg",    label: "// SVG",        color: C.accent  },
  { id: "canvas", label: "// Canvas",     color: C.purple  },
  { id: "coord",  label: "// Координати", color: C.yellow  },
];

export default function SvgVsCanvas() {
  const [active, setActive] = useState("svg");

  const cardStyle = {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 14, overflow: "hidden", marginBottom: 12,
  };
  const hdrStyle = {
    background: C.surface2, padding: "10px 18px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };
  const badge = (color, label) => (
    <span style={{ fontSize: 11, padding: "2px 9px", background: color+"22", color, borderRadius: 99 }}>{label}</span>
  );

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      padding: "28px 22px", boxSizing: "border-box",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        input[type=range] { height: 4px; cursor: pointer; }
        *::-webkit-scrollbar { width: 5px; }
        *::-webkit-scrollbar-thumb { background: #2a2c4a; border-radius: 99px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes ripple { 0% { r:4; opacity:.8 } 100% { r:38; opacity:0 } }
        .tab-panel { animation: fadeUp .3s ease both; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.accent }}>
            🎨 SVG vs Canvas
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            Canvas забуває фігури одразу — і це його суперсила
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
          {TABS.map(tab => {
            const on = active === tab.id;
            return (
              <button key={tab.id} onClick={() => setActive(tab.id)} style={{
                background: on ? tab.color+"18" : "transparent",
                border: `1px solid ${on ? tab.color : C.border}`,
                borderRadius: 8, padding: "7px 16px",
                fontSize: 12, color: on ? tab.color : C.muted,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all .2s ease",
              }}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* SVG */}
        {active === "svg" && (
          <div key="svg" className="tab-panel">
            <div style={cardStyle}>
              <div style={hdrStyle}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>SVG — DOM елементи</span>
                {badge(C.accent, "живий DOM")}
              </div>
              <div style={{ padding: 18 }}>
                <SvgDemo />
                <CodeBox>
                  <Kw c="const" /> el = document.<Ac c="querySelector" />(<Val c="'circle'" />);<Cm c="  // DOM-нода" />{"\n"}
                  el.<Ac c="setAttribute" />(<Val c="'fill'" />, <Val c="'red'" />);<Cm c="  // ✓ працює" />{"\n"}
                  el.<Ac c="addEventListener" />(<Val c="'click'" />, handler);<Cm c="  // ✓ події" />
                </CodeBox>
              </div>
            </div>
            <ProsCons items={[
              { color: C.green, title: "✓ Коли SVG",      rows: ["Іконки та ілюстрації","Інтерактивні схеми","Діаграми з hover","Потрібен CSS / анімація"] },
              { color: C.red,   title: "✗ Не підходить",  rows: ["1000+ елементів","Ігри та частинки","Покадрова анімація","Обробка зображень"] },
            ]} />
          </div>
        )}

        {/* Canvas */}
        {active === "canvas" && (
          <div key="canvas" className="tab-panel">
            <div style={cardStyle}>
              <div style={hdrStyle}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.purple }}>Canvas — пікселі на полотні</span>
                {badge(C.purple, "rAF loop")}
              </div>
              <div style={{ padding: 18 }}>
                <CanvasDemo />
                <CodeBox>
                  <Cm c="// кожен кадр — чисте полотно" />{"\n"}
                  <Kw c="function" /> <Ac c="draw" />() {"{"}  {"\n"}
                  {"  "}ctx.<Ac c="clearRect" />(<Nm c="0" />, <Nm c="0" />, W, H);<Cm c="  // забули" />{"\n"}
                  {"  "}particles.<Ac c="forEach" />{`(p => drawParticle(p));`}{"\n"}
                  {"  "}<Kw c="requestAnimationFrame" />(draw);{"\n"}
                  {"}"}
                </CodeBox>
              </div>
            </div>
            <ProsCons items={[
              { color: C.green, title: "✓ Коли Canvas",   rows: ["Ігри та симуляції","Тисячі частинок","Обробка зображень","Висока FPS анімація"] },
              { color: C.red,   title: "✗ Не підходить",  rows: ["Потрібні click-події","CSS стилізація","Accessibility","Кілька статичних форм"] },
            ]} />
          </div>
        )}

        {/* Coord */}
        {active === "coord" && (
          <div key="coord" className="tab-panel">
            <div style={cardStyle}>
              <div style={hdrStyle}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.yellow }}>Координатна система</span>
                {badge(C.yellow, "(0,0) = лівий верх")}
              </div>
              <div style={{ padding: 18 }}>
                <CoordDemo />
                <CodeBox>
                  <Cm c="// (0,0) — лівий верхній кут" />{"\n"}
                  ctx.<Ac c="translate" />(cx, cy);<Cm c="  // зміщуємо origin" />{"\n"}
                  ctx.<Ac c="rotate" />(Math.PI / <Nm c="4" />);<Cm c="  // повертаємо на 45°" />{"\n"}
                  ctx.<Ac c="fillRect" />(<Nm c="-36" />, <Nm c="-22" />, <Nm c="72" />, <Nm c="44" />);<Cm c="  // відносно нового origin" />
                </CodeBox>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
