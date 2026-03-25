import React, { useState } from "react";

const COLORS = {
  bg: "#0a0d14",
  surface: "#1a1b2e",
  surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff",
  purple: "#bb9af7",
  green: "#9ece6a",
  orange: "#ff9e64",
  yellow: "#e0af68",
  muted: "#565f89",
  text: "#c0caf5",
  red: "#ff5f57",
};

export default function GridDemo() {
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState(2);
  const [rowHeight, setRowHeight] = useState(120);

  const cellCount = 9;
  const cellColors = [
    "#7dcfff", "#bb9af7", "#9ece6a",
    "#ff9e64", "#e0af68", "#f7768e",
    "#bb9af7", "#7dcfff", "#9ece6a",
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${COLORS.bg} 0%, #131622 100%)`,
      color: COLORS.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: "40px 30px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "40px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>

        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 50, textAlign: "center" }}>
          <h1 style={{
            fontSize: 42,
            fontWeight: 700,
            margin: 0,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            🎨 CSS Grid Playground
          </h1>
          <p style={{
            fontSize: 14,
            color: COLORS.muted,
            marginTop: 8,
            margin: "8px 0 0 0",
          }}>
            Змінюй парамтери — дивись як сітка перебудовується
          </p>
        </div>

        {/* ─── CONTROLS ─── */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 24,
          marginBottom: 40,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
        }}>
          {/* Columns Control */}
          <div>
            <div style={{
              fontSize: 11,
              color: COLORS.green,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              📊 Колон
            </div>
            <div style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}>
              <input
                type="range"
                min="1"
                max="6"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  accentColor: COLORS.accent,
                }}
              />
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.accent,
                minWidth: 30,
              }}>
                {cols}
              </span>
            </div>
          </div>

          {/* Gap Control */}
          <div>
            <div style={{
              fontSize: 11,
              color: COLORS.orange,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              🔲 Проміжок (gap)
            </div>
            <div style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}>
              <input
                type="range"
                min="0"
                max="30"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  accentColor: COLORS.orange,
                }}
              />
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.orange,
                minWidth: 30,
              }}>
                {gap}px
              </span>
            </div>
          </div>

          {/* Row Height Control */}
          <div>
            <div style={{
              fontSize: 11,
              color: COLORS.purple,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              📏 Висота рядка
            </div>
            <div style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}>
              <input
                type="range"
                min="60"
                max="180"
                value={rowHeight}
                onChange={(e) => setRowHeight(Number(e.target.value))}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  accentColor: COLORS.purple,
                }}
              />
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.purple,
                minWidth: 30,
              }}>
                {rowHeight}px
              </span>
            </div>
          </div>
        </div>

        {/* ─── GRID PREVIEW ─── */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 40,
          boxShadow: `0 0 40px rgba(125, 207, 255, 0.1)`,
        }}>
          {/* Grid Code Label */}
          <div style={{
            background: COLORS.surface2,
            padding: "12px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            fontSize: 12,
            color: COLORS.muted,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {`display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px; grid-auto-rows: ${rowHeight}px;`}
          </div>

          {/* Actual Grid */}
          <div style={{
            padding: 24,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: `${gap}px`,
            gridAutoRows: `${rowHeight}px`,
          }}>
            {Array.from({ length: cellCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: cellColors[i] + "22",
                  border: `2px solid ${cellColors[i]}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: cellColors[i],
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = `0 0 20px ${cellColors[i]}44`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* ─── INFO CARDS ─── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16,
        }}>
          {/* Card 1 */}
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.accent}11, ${COLORS.purple}11)`,
            border: `1px solid ${COLORS.accent}33`,
            borderRadius: 10,
            padding: 18,
            fontSize: 12,
          }}>
            <div style={{
              fontSize: 11,
              color: COLORS.accent,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
            }}>
              grid-template-columns
            </div>
            <div style={{ color: COLORS.muted, lineHeight: 1.6 }}>
              <code style={{ color: COLORS.green }}>repeat(3, 1fr)</code> —
              <br />3 колони розміром поривну
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.orange}11, ${COLORS.yellow}11)`,
            border: `1px solid ${COLORS.orange}33`,
            borderRadius: 10,
            padding: 18,
            fontSize: 12,
          }}>
            <div style={{
              fontSize: 11,
              color: COLORS.orange,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
            }}>
              gap
            </div>
            <div style={{ color: COLORS.muted, lineHeight: 1.6 }}>
              Прогалина між ячейками
              <br />у всіх напрямках одночасно
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.purple}11, ${COLORS.green}11)`,
            border: `1px solid ${COLORS.purple}33`,
            borderRadius: 10,
            padding: 18,
            fontSize: 12,
          }}>
            <div style={{
              fontSize: 11,
              color: COLORS.purple,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
            }}>
              grid-auto-rows
            </div>
            <div style={{ color: COLORS.muted, lineHeight: 1.6 }}>
              Висота кожного рядка
              <br />можна встановити явно
            </div>
          </div>
        </div>

        {/* ─── TIP ─── */}
        <div style={{
          background: COLORS.surface2,
          border: `1px solid ${COLORS.yellow}44`,
          borderRadius: 10,
          padding: 20,
          marginTop: 30,
          fontSize: 13,
          color: COLORS.text,
          lineHeight: 1.7,
        }}>
          <span style={{ color: COLORS.yellow, fontWeight: 600 }}>💡 Знай:</span>
          <br />
          <code style={{ color: COLORS.green }}>1fr</code> означає{" "}
          <span style={{ color: COLORS.accent }}>1 fraction</span> — одиниця вільного місця.
          <br />
          Якщо <code style={{ color: COLORS.green }}>repeat(3, 1fr)</code>, то місце ділиться порівну на 3 колони.
          <br />
          А <code style={{ color: COLORS.green }}>repeat(2, 1fr 2fr)</code> — перша колона вузька, друга — удвічі ширша.
        </div>

      </div>
    </div>
  );
}
