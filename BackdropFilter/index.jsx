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

const BLEND_MODES = [
  "multiply",
  "screen",
  "overlay",
  "soft-light",
  "hard-light",
  "color-dodge",
  "color-burn",
  "darken",
  "lighten",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

const BACKDROP_FILTERS = [
  { name: "blur(10px)", value: "blur(10px)" },
  { name: "blur(20px)", value: "blur(20px)" },
  { name: "brightness(1.2)", value: "brightness(1.2)" },
  { name: "contrast(1.5)", value: "contrast(1.5)" },
  { name: "blur(10px) brightness(1.2)", value: "blur(10px) brightness(1.2)" },
  { name: "blur(15px) contrast(1.3)", value: "blur(15px) contrast(1.3)" },
];

export default function BackdropFilterDemo() {
  const [blendMode, setBlendMode] = useState("multiply");
  const [backdropFilter, setBackdropFilter] = useState("blur(10px)");
  const [showOverlay, setShowOverlay] = useState(true);
  const [showBackground, setShowBackground] = useState(true);

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: "50px 30px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "50px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 60, marginTop: 5, textAlign: "center" }}>
          <h1 style={{
            fontSize: 46,
            fontWeight: 700,
            margin: 0,
            color: COLORS.accent,
          }}>
            ✨ backdrop-filter & mix-blend-mode
          </h1>
          <p style={{
            fontSize: 15,
            color: COLORS.muted,
            marginTop: 14,
            lineHeight: 1.6,
          }}>
            Ефекти як у Figma, але в чистому CSS
          </p>
        </div>

        {/* ─── BACKGROUND DEMO ─── */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: `0 0 60px ${COLORS.purple}11`,
          marginTop: 5,
          marginBottom: 5,
        }}>
          <div style={{
            background: COLORS.surface2,
            padding: "14px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            fontSize: 12,
            color: COLORS.muted,
          }}>
            🎬 Live Demo — змінюй режим змішування та розмивок
          </div>

          {/* Interactive Preview */}
          <div style={{
            position: "relative",
            width: "100%",
            height: 500,
            background: `linear-gradient(135deg, 
              ${COLORS.purple}44 0%, 
              ${COLORS.accent}44 50%, 
              ${COLORS.orange}44 100%)`,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Background Pattern */}
            {showBackground && (
              <svg
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: 0.3,
                }}
                viewBox="0 0 400 400"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={Math.random() * 400}
                    cy={Math.random() * 400}
                    r={Math.random() * 30 + 10}
                    fill="none"
                    stroke={COLORS.accent}
                    strokeWidth="1"
                  />
                ))}
              </svg>
            )}

            {/* Main Card with backdrop-filter */}
            <div style={{
              position: "relative",
              width: 350,
              padding: 32,
              borderRadius: 16,
              background: "rgba(10, 13, 20, 0.7)",
              border: `1px solid ${COLORS.accent}44`,
              backdropFilter: backdropFilter,
              WebkitBackdropFilter: backdropFilter,
              textAlign: "center",
              zIndex: 1,
            }}>
              <div style={{
                fontSize: 12,
                color: COLORS.yellow,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Frosted Glass Card
              </div>
              <h2 style={{
                fontSize: 28,
                fontWeight: 700,
                margin: "0 0 16px 0",
                color: COLORS.accent,
              }}>
                backdrop-filter
              </h2>
              <p style={{
                fontSize: 13,
                color: COLORS.text,
                margin: 0,
                lineHeight: 1.6,
              }}>
                Цей блок має розмивок позаду.
                <br />
                Змінюй значення нижче!
              </p>
            </div>

            {/* Overlay with mix-blend-mode */}
            {showOverlay && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, 
                    ${COLORS.purple}66 0%, 
                    ${COLORS.orange}66 100%)`,
                  mixBlendMode: blendMode,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            )}
          </div>
        </div>

        {/* ─── CONTROLS ─── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 30,
          marginTop: 5,
          marginBottom: 5,
        }}>
          {/* backdrop-filter control */}
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 28,
          }}>
            <div style={{
              fontSize: 12,
              color: COLORS.green,
              fontWeight: 600,
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              🎨 backdrop-filter
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}>
              {BACKDROP_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setBackdropFilter(filter.value)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `2px solid ${
                      backdropFilter === filter.value
                        ? COLORS.accent
                        : COLORS.border
                    }`,
                    background:
                      backdropFilter === filter.value
                        ? COLORS.accent + "22"
                        : COLORS.surface2,
                    color:
                      backdropFilter === filter.value
                        ? COLORS.accent
                        : COLORS.text,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    textAlign: "left",
                  }}
                >
                  <code style={{
                    color: "inherit",
                    fontSize: 11,
                  }}>
                    {filter.name}
                  </code>
                </button>
              ))}
            </div>

            <div style={{
              marginTop: 20,
              padding: "12px 16px",
              background: COLORS.surface2,
              borderRadius: 8,
              fontSize: 11,
              color: COLORS.muted,
              fontFamily: "inherit",
              border: `1px solid ${COLORS.border}`,
            }}>
              <code style={{ color: COLORS.green, fontWeight: 600 }}>
                {backdropFilter}
              </code>
            </div>
          </div>

          {/* mix-blend-mode control */}
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 28,
          }}>
            <div style={{
              fontSize: 12,
              color: COLORS.purple,
              fontWeight: 600,
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              🌈 mix-blend-mode
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
              {BLEND_MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBlendMode(mode)}
                  style={{
                    padding: "12px 12px",
                    borderRadius: 8,
                    border: `2px solid ${
                      blendMode === mode ? COLORS.accent : COLORS.border
                    }`,
                    background:
                      blendMode === mode
                        ? COLORS.accent + "22"
                        : COLORS.surface2,
                    color:
                      blendMode === mode ? COLORS.accent : COLORS.text,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div style={{
              marginTop: 20,
              padding: "12px 16px",
              background: COLORS.surface2,
              borderRadius: 8,
              fontSize: 11,
              color: COLORS.muted,
              fontFamily: "inherit",
              border: `1px solid ${COLORS.border}`,
            }}>
              <code style={{ color: COLORS.green, fontWeight: 600 }}>
                {blendMode}
              </code>
            </div>
          </div>
        </div>

        {/* ─── TOGGLES ─── */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 28,
          marginTop: 5,
          marginBottom: 5,
        }}>
          <div style={{
            fontSize: 12,
            color: COLORS.yellow,
            fontWeight: 600,
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            ⚙️ Налаштування
          </div>

          <div style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              fontSize: 13,
              color: COLORS.text,
            }}>
              <input
                type="checkbox"
                checked={showOverlay}
                onChange={(e) => setShowOverlay(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: "pointer",
                  accentColor: COLORS.accent,
                }}
              />
              Показати overlay (mix-blend-mode)
            </label>

            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              fontSize: 13,
              color: COLORS.text,
            }}>
              <input
                type="checkbox"
                checked={showBackground}
                onChange={(e) => setShowBackground(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: "pointer",
                  accentColor: COLORS.accent,
                }}
              />
              Показати background pattern
            </label>
          </div>
        </div>

        {/* ─── CODE EXAMPLES ─── */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          overflow: "hidden",
          marginTop: 5,
          marginBottom: 5,
        }}>
          <div style={{
            background: COLORS.surface2,
            padding: "14px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            fontSize: 12,
            color: COLORS.muted,
          }}>
            💻 CSS код:
          </div>

          <pre style={{
            padding: 24,
            margin: 0,
            fontSize: 12,
            color: COLORS.green,
            lineHeight: 1.8,
            overflow: "auto",
          }}>
{`.card {
  /* Розмивок позаду */
  backdrop-filter: ${backdropFilter};
  -webkit-backdrop-filter: ${backdropFilter};
  
  background: rgba(10, 13, 20, 0.7);
  border: 1px solid rgba(125, 207, 255, 0.3);
}

.overlay {
  /* Режим змішування */
  mix-blend-mode: ${blendMode};
  
  background: linear-gradient(135deg, 
    rgba(187, 154, 247, 0.4) 0%,
    rgba(255, 158, 100, 0.4) 100%);
}`}
          </pre>
        </div>

        {/* ─── INFO CARDS ─── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginTop: 5,
          marginBottom: 5,
        }}>
          {/* Card 1 */}
          <div style={{
            background: `${COLORS.green}11`,
            border: `1px solid ${COLORS.green}33`,
            borderRadius: 12,
            padding: 24,
            fontSize: 13,
          }}>
            <div style={{
              fontSize: 11,
              color: COLORS.green,
              fontWeight: 600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              🎨 backdrop-filter
            </div>
            <div style={{ color: COLORS.text, lineHeight: 1.8 }}>
              Розмиває, змінює яскравість і контраст
              <br />
              <strong>всього що позаду</strong> елемента.
              <br /><br />
              ⚠️ Використовуй
              <code style={{
                background: COLORS.surface2,
                padding: "2px 6px",
                borderRadius: 3,
                color: COLORS.accent,
                fontSize: 11,
              }}>
                -webkit-
              </code>
              префікс для мобілей!
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: `${COLORS.purple}11`,
            border: `1px solid ${COLORS.purple}33`,
            borderRadius: 12,
            padding: 24,
            fontSize: 13,
          }}>
            <div style={{
              fontSize: 11,
              color: COLORS.purple,
              fontWeight: 600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              🌈 mix-blend-mode
            </div>
            <div style={{ color: COLORS.text, lineHeight: 1.8 }}>
              15 режимів змішування кольорів.
              <br />
              Як у Figma/Photoshop!
              <br /><br />
              <strong>multiply</strong> — затемнення<br />
              <strong>screen</strong> — розсвітлення
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            background: `${COLORS.accent}11`,
            border: `1px solid ${COLORS.accent}33`,
            borderRadius: 12,
            padding: 24,
            fontSize: 13,
          }}>
            <div style={{
              fontSize: 11,
              color: COLORS.accent,
              fontWeight: 600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              💡 Комбінація
            </div>
            <div style={{ color: COLORS.text, lineHeight: 1.8 }}>
              Використовуй обидва разом для
              <strong> неймовірних ефектів</strong>.
              <br /><br />
              Frosted glass + затемнення overlay
              = магія в браузері ✨
            </div>
          </div>
        </div>

        {/* ─── TIP ─── */}
        <div style={{
          background: COLORS.surface2,
          border: `1px solid ${COLORS.yellow}44`,
          borderRadius: 12,
          padding: 28,
          fontSize: 14,
          color: COLORS.text,
          lineHeight: 1.8,
          marginTop: 5,
          marginBottom: 5,
        }}>
          <span style={{ color: COLORS.yellow, fontWeight: 600, fontSize: 15 }}>
            🎯 Бонус — @supports для сумісності:
          </span>
          <br />
          <code style={{
            background: COLORS.surface,
            padding: "8px 12px",
            borderRadius: 6,
            color: COLORS.green,
            fontSize: 12,
            display: "block",
            marginTop: 12,
            overflow: "auto",
          }}>
            @supports (backdrop-filter: blur(1px)) {`{`}
            <br />
            &nbsp;&nbsp;.glass {`{`} backdrop-filter: blur(10px); {`}`}
            <br />
            {`}`}
          </code>
        </div>

      </div>
    </div>
  );
}
