import React, { useState } from "react";

const THEMES = {
  dark: {
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
  },
  light: {
    bg: "#fafafa",
    surface: "#ffffff",
    surface2: "#f5f5f5",
    border: "#e0e0e0",
    accent: "#0066ff",
    purple: "#7c3aed",
    green: "#059669",
    orange: "#ea580c",
    yellow: "#ca8a04",
    muted: "#999999",
    text: "#1a1a1a",
    red: "#dc2626",
  },
};

export default function CustomPropsDemo() {
  const [theme, setTheme] = useState("dark");
  const [selectedColor, setSelectedColor] = useState("accent");
  const [customColor, setCustomColor] = useState(THEMES.dark.accent);

  const currentTheme = THEMES[theme];
  
  // Обчислюємо або темний, або світлий вихідний колір для бекгрунду
  const livePreviewBg = selectedColor === "bg" ? customColor : currentTheme.surface;
  const livePreviewText = selectedColor === "text" ? customColor : currentTheme.text;
  const livePreviewAccent = selectedColor === "accent" ? customColor : currentTheme.accent;

  const colorKeys = ["accent", "purple", "green", "orange", "yellow", "text"];

  return (
    <div style={{
      minHeight: "100vh",
      background: currentTheme.bg,
      color: currentTheme.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: "50px 30px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "50px",
      transition: "all 0.4s ease",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>

        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 60, textAlign: "center" }}>
          <h1 style={{
            fontSize: 46,
            fontWeight: 700,
            margin: 0,
            color: currentTheme.accent,
            transition: "color 0.3s ease",
          }}>
            🎨 CSS Custom Properties
          </h1>
          <p style={{
            fontSize: 15,
            color: currentTheme.muted,
            marginTop: 14,
            transition: "color 0.3s ease",
            lineHeight: 1.6,
          }}>
            Змінюй кольори в реальному часі — тема оновляється всюди
          </p>
        </div>

        {/* ─── THEME TOGGLE ─── */}
        <div style={{
          display: "flex",
          gap: 14,
          justifyContent: "center",
          marginBottom: 50,
        }}>
          {["dark", "light"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setCustomColor(THEMES[t].accent);
              }}
              style={{
                padding: "12px 28px",
                borderRadius: 10,
                border: `2px solid ${currentTheme[t === theme ? "accent" : "border"]}`,
                background: t === theme ? currentTheme.accent + "22" : "transparent",
                color: t === theme ? currentTheme.accent : currentTheme.muted,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {t === "dark" ? "🌙 Темна" : "☀️ Світла"}
            </button>
          ))}
        </div>

        {/* ─── COLOR PICKER ─── */}
        <div style={{
          background: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: 14,
          padding: 28,
          transition: "all 0.3s ease",
        }}>
          <div style={{
            fontSize: 12,
            color: currentTheme.green,
            fontWeight: 600,
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            🎯 Вибери CSS змінну для зміни:
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 14,
          }}>
            {colorKeys.map((key) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedColor(key);
                  setCustomColor(currentTheme[key]);
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `2px solid ${selectedColor === key ? currentTheme.accent : currentTheme.border}`,
                  background: selectedColor === key ? currentTheme.accent + "22" : currentTheme.surface2,
                  color: selectedColor === key ? currentTheme.accent : currentTheme.text,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: currentTheme[key],
                    border: `1px solid ${currentTheme.border}`,
                  }}
                />
                <span style={{ flex: 1, textAlign: "left" }}>--{key}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── COLOR INPUT ─── */}
        <div style={{
          background: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: 14,
          padding: 28,
          transition: "all 0.3s ease",
        }}>
          <div style={{
            fontSize: 12,
            color: currentTheme.orange,
            fontWeight: 600,
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            🎨 Обери новий колір:
          </div>

          <div style={{
            display: "flex",
            gap: 28,
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                border: `3px solid ${currentTheme.border}`,
                cursor: "pointer",
              }}
            />
            <div style={{ flex: 1, minWidth: 250 }}>
              <div style={{
                fontSize: 11,
                color: currentTheme.muted,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}>
                CSS змінна:
              </div>
              <div style={{
                fontSize: 16,
                color: currentTheme.green,
                fontFamily: "inherit",
                fontWeight: 600,
                marginBottom: 14,
              }}>
                <code style={{
                  background: currentTheme.surface2,
                  padding: "8px 12px",
                  borderRadius: 6,
                }}>var(--{selectedColor})</code>
              </div>
              <div style={{
                fontSize: 13,
                color: currentTheme.muted,
                marginBottom: 6,
              }}>
                Значення:
              </div>
              <div style={{
                fontSize: 18,
                color: customColor,
                fontWeight: 700,
                fontFamily: "inherit",
                padding: "10px 14px",
                background: currentTheme.surface2,
                borderRadius: 6,
                border: `2px solid ${customColor}55`,
              }}>
                {customColor}
              </div>
            </div>
          </div>
        </div>

        {/* ─── LIVE PREVIEW ─── */}
        <div style={{
          background: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: 14,
          overflow: "hidden",
          transition: "all 0.3s ease",
          boxShadow: `0 0 40px ${currentTheme.accent}22`,
        }}>
          <div style={{
            background: currentTheme.surface2,
            padding: "14px 20px",
            borderBottom: `1px solid ${currentTheme.border}`,
            fontSize: 12,
            color: currentTheme.muted,
            fontFamily: "inherit",
          }}>
            📦 Live Preview — змінена змінна застосується автоматично
          </div>

          <div style={{ 
            padding: "40px 32px", 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: 40,
            minHeight: 320,
          }}>
            {/* Card 1 */}
            <div style={{
              background: `${customColor}15`,
              border: `2px solid ${customColor}`,
              borderRadius: 12,
              padding: 24,
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <div style={{
                fontSize: 11,
                color: currentTheme.muted,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}>
                Card Component
              </div>
              <h3 style={{
                margin: "0 0 12px 0",
                fontSize: 20,
                fontWeight: 700,
                color: customColor,
                transition: "color 0.3s ease",
              }}>
                Привіт! 👋
              </h3>
              <p style={{
                fontSize: 13,
                color: currentTheme.text,
                margin: 0,
                lineHeight: 1.6,
              }}>
                Цей колір змінюється разом із твоєю змінною.
                <br />
                CSS автоматично застосує його.
              </p>
            </div>

            {/* Buttons */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              justifyContent: "center",
            }}>
              <button style={{
                padding: "16px 24px",
                background: customColor,
                color: currentTheme.bg,
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                Натисни мене
              </button>
              <button style={{
                padding: "16px 24px",
                background: "transparent",
                color: customColor,
                border: `2px solid ${customColor}`,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = customColor + "11";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
              >
                Чи мене?
              </button>
              <div style={{
                fontSize: 12,
                color: currentTheme.muted,
                marginTop: 8,
                padding: "12px",
                background: currentTheme.surface2,
                borderRadius: 6,
                textAlign: "center",
              }}>
                <code style={{ color: customColor, fontWeight: 600 }}>
                  var(--{selectedColor})
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CODE EXAMPLE ─── */}
        <div style={{
          background: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: 14,
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}>
          <div style={{
            background: currentTheme.surface2,
            padding: "14px 20px",
            borderBottom: `1px solid ${currentTheme.border}`,
            fontSize: 12,
            color: currentTheme.muted,
            fontFamily: "inherit",
          }}>
            💻 Як це працює в CSS:
          </div>
          <pre style={{
            padding: 24,
            margin: 0,
            fontSize: 13,
            color: currentTheme.green,
            lineHeight: 1.8,
            overflow: "auto",
            background: currentTheme.surface,
          }}>
{`:root {
  --bg: "${currentTheme.bg}";
  --accent: "${customColor}";
  --text: "${currentTheme.text}";
}

.card {
  background: var(--bg);
  color: var(--text);
  border: 2px solid var(--accent);
}

button {
  background: var(--accent);
  transition: all 0.3s ease; /* Гладко! */
}`}
          </pre>
        </div>

        {/* ─── TIP ─── */}
        <div style={{
          background: currentTheme.surface2,
          border: `1px solid ${currentTheme.yellow}44`,
          borderRadius: 12,
          padding: 28,
          fontSize: 14,
          color: currentTheme.text,
          lineHeight: 1.8,
          transition: "all 0.3s ease",
        }}>
          <span style={{ color: currentTheme.yellow, fontWeight: 600, fontSize: 15 }}>🎯 Ключ до успіху:</span>
          <br />
          CSS змінні працюють з <code style={{
            background: currentTheme.surface,
            padding: "4px 8px",
            borderRadius: 5,
            color: currentTheme.green,
            fontWeight: 600,
          }}>transition</code> — можеш робити гладкі зміни тем без JavaScript анімацій!
          <br /><br />
          Встав <code style={{
            background: currentTheme.surface,
            padding: "4px 8px",
            borderRadius: 5,
            color: currentTheme.green,
            fontWeight: 600,
          }}>transition: 0.3s</code> на елементи і тема змінюватиметься як на кінемо 🎬
        </div>

      </div>
    </div>
  );
}
