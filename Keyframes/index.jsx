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

const ANIMATIONS = [
  {
    name: "slideIn",
    label: "Вхід зліва",
    description: "Елемент вїжджає зліва з розтворенням",
    css: `@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateX(-100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}`,
  },
  {
    name: "bounce",
    label: "Скачок",
    description: "Елемент скаче вверх-вниз",
    css: `@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-30px);
  }
}`,
  },
  {
    name: "pulse",
    label: "Пульсація",
    description: "Елемент пульсує за розміром та прозорістю",
    css: `@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.15);
  }
}`,
  },
  {
    name: "spin",
    label: "Обертання",
    description: "Фон крутиться, а вміст стоїть на місці",
    css: `@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinReverse {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}`,
  },
  {
    name: "fadeInScale",
    label: "Розтворення + Масштаб",
    description: "Вхід з масштабуванням",
    css: `@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}`,
  },
  {
    name: "colorFlow",
    label: "Перелив кольорів",
    description: "Гладке переливання через спектр",
    css: `@keyframes colorFlow {
  0% {
    background: linear-gradient(135deg, #7dcfff, #bb9af7);
  }
  50% {
    background: linear-gradient(135deg, #bb9af7, #9ece6a);
  }
  100% {
    background: linear-gradient(135deg, #9ece6a, #ff9e64);
  }
}`,
  },
];

const DURATIONS = [0.3, 0.6, 1, 1.5, 2];

export default function KeyframesDemo() {
  const [selectedAnimation, setSelectedAnimation] = useState("slideIn");
  const [duration, setDuration] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [showCode, setShowCode] = useState(true);

  const currentAnim = ANIMATIONS.find((a) => a.name === selectedAnimation);

  // Функція для обчислення анімації з затримкою між циклами
  const getAnimationStyle = (animName, dur) => {
    const totalDuration = dur + 0.5; // Додаємо 0.5s затримку після анімації
    const animationTimingFunction = 
      animName === "spin" ? "linear" : "ease-in-out";

    if (animName === "slideIn" || animName === "fadeInScale") {
      return `${animName} ${dur}s ${animationTimingFunction} forwards`;
    }
    
    return `${animName} ${dur}s ${animationTimingFunction} infinite`;
  };

  const styles = `
    @keyframes slideIn {
      0% {
        opacity: 0;
        transform: translateX(-100px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-30px);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.15);
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes spinReverse {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(-360deg);
      }
    }

    @keyframes fadeInScale {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes colorFlow {
      0% {
        background: linear-gradient(135deg, #7dcfff, #bb9af7);
      }
      50% {
        background: linear-gradient(135deg, #bb9af7, #9ece6a);
      }
      100% {
        background: linear-gradient(135deg, #9ece6a, #ff9e64);
      }
    }

    .animated-box {
      animation-play-state: running;
    }
  `;

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
      <style>{styles}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 60, marginTop: 5, textAlign: "center" }}>
          <h1 style={{
            fontSize: 46,
            fontWeight: 700,
            margin: 0,
            color: COLORS.accent,
          }}>
            🎬 CSS @keyframes Анімації
          </h1>
          <p style={{
            fontSize: 15,
            color: COLORS.muted,
            marginTop: 14,
            lineHeight: 1.6,
          }}>
            Складні анімації прямо в CSS без JavaScript
          </p>
        </div>

        {/* ─── ANIMATION PREVIEW ─── */}
        <div style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          overflow: "hidden",
          marginTop: 5,
          marginBottom: 5,
          boxShadow: `0 0 60px ${COLORS.purple}11`,
        }}>
          <div style={{
            background: COLORS.surface2,
            padding: "14px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            fontSize: 12,
            color: COLORS.muted,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span>🎯 Live Preview</span>
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                color: COLORS.accent,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              {isRunning ? "⏸ Пауза" : "▶ Грай"}
            </button>
          </div>

          <div style={{
            padding: "60px 32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
            background: `linear-gradient(135deg, ${COLORS.surface2}44, ${COLORS.surface}44)`,
          }}>
            {selectedAnimation === "spin" ? (
              // Special layout for spin animation
              <div
                className="animated-box"
                style={{
                  width: 120,
                  height: 120,
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  position: "relative",
                  animation: `spin ${duration}s linear infinite`,
                  animationPlayState: isRunning ? "running" : "paused",
                }}
              >
                {/* Внутрішній вміст що обертається у зворотному напрямку */}
                <div
                  style={{
                    animation: `spinReverse ${duration}s linear infinite`,
                    animationPlayState: isRunning ? "running" : "paused",
                  }}
                >
                  ✨
                </div>
              </div>
            ) : (
              // Default animated box
              <div
                className="animated-box"
                style={{
                  width: 120,
                  height: 120,
                  background:
                    selectedAnimation === "colorFlow"
                      ? undefined
                      : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  animation: getAnimationStyle(selectedAnimation, duration),
                  animationPlayState: isRunning ? "running" : "paused",
                }}
              >
                ✨
              </div>
            )}
          </div>
        </div>

        {/* ─── ANIMATION SELECTOR ─── */}
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
            color: COLORS.green,
            fontWeight: 600,
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            🎨 Вибери анімацію:
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}>
            {ANIMATIONS.map((anim) => (
              <button
                key={anim.name}
                onClick={() => {
                  setSelectedAnimation(anim.name);
                  setIsRunning(true);
                }}
                style={{
                  padding: "16px 14px",
                  borderRadius: 10,
                  border: `2px solid ${
                    selectedAnimation === anim.name
                      ? COLORS.accent
                      : COLORS.border
                  }`,
                  background:
                    selectedAnimation === anim.name
                      ? COLORS.accent + "22"
                      : COLORS.surface2,
                  color:
                    selectedAnimation === anim.name
                      ? COLORS.accent
                      : COLORS.text,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span>{anim.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: COLORS.muted,
                    fontWeight: 400,
                  }}
                >
                  {anim.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── CONTROLS ─── */}
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
            color: COLORS.orange,
            fontWeight: 600,
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            ⏱ Тривалість анімації:
          </div>

          <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: `2px solid ${
                    duration === d ? COLORS.accent : COLORS.border
                  }`,
                  background:
                    duration === d ? COLORS.accent + "22" : COLORS.surface2,
                  color: duration === d ? COLORS.accent : COLORS.text,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                }}
              >
                {d}s
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
              animation: {selectedAnimation} {duration}s ease-in-out;
            </code>
          </div>
        </div>

        {/* ─── CODE SECTION ─── */}
        {showCode && (
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span>💻 CSS @keyframes код:</span>
              <button
                onClick={() => setShowCode(!showCode)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: COLORS.muted,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>

            <pre style={{
              padding: 24,
              margin: 0,
              fontSize: 12,
              color: COLORS.green,
              lineHeight: 1.8,
              overflow: "auto",
              background: COLORS.surface,
            }}>
              {currentAnim?.css}
            </pre>
          </div>
        )}

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
              🎯 @keyframes
            </div>
            <div style={{ color: COLORS.text, lineHeight: 1.8 }}>
              Визначає <strong>кадри анімації</strong>.
              <br />
              0% — стартова позиція<br />
              100% — кінцева позиція<br />
              Можна додавати 50%, 25%, тощо
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
              ⏱ animation властивості
            </div>
            <div style={{ color: COLORS.text, lineHeight: 1.8 }}>
              <strong>duration</strong> — як довго<br />
              <strong>timing-function</strong> — як плавно<br />
              <strong>delay</strong> — затримка<br />
              <strong>iteration-count</strong> — скільки разів
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
              💡 Бонус
            </div>
            <div style={{ color: COLORS.text, lineHeight: 1.8 }}>
              <code style={{
                background: COLORS.surface2,
                padding: "2px 6px",
                borderRadius: 3,
                color: COLORS.green,
                fontSize: 11,
              }}>
                animation-play-state
              </code>
              <br />
              Паузуй/граймай анімацію без JS!
            </div>
          </div>
        </div>

        {/* ─── TIMING FUNCTIONS ─── */}
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
            🎛 Timing Functions (як плавно):
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}>
            {[
              { name: "linear", desc: "постійна швидкість" },
              { name: "ease", desc: "природна" },
              { name: "ease-in", desc: "повільний старт" },
              { name: "ease-out", desc: "повільний кінець" },
              { name: "ease-in-out", desc: "обидва кінця" },
            ].map((tf) => (
              <div
                key={tf.name}
                style={{
                  padding: 14,
                  background: COLORS.surface2,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: 11,
                }}
              >
                <div style={{ color: COLORS.yellow, fontWeight: 600, marginBottom: 4 }}>
                  {tf.name}
                </div>
                <div style={{ color: COLORS.muted, fontSize: 10 }}>
                  {tf.desc}
                </div>
              </div>
            ))}
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
            🚀 Performance tip:
          </span>
          <br />
          Анімуй тільки <code style={{
            background: COLORS.surface,
            padding: "4px 8px",
            borderRadius: 5,
            color: COLORS.green,
            fontWeight: 600,
          }}>transform</code> та <code style={{
            background: COLORS.surface,
            padding: "4px 8px",
            borderRadius: 5,
            color: COLORS.green,
            fontWeight: 600,
          }}>opacity</code>.
          <br />
          Вони мають GPU прискорення! Анімування <code style={{
            background: COLORS.surface,
            padding: "4px 8px",
            borderRadius: 5,
            color: COLORS.red,
            fontWeight: 600,
          }}>width</code>, <code style={{
            background: COLORS.surface,
            padding: "4px 8px",
            borderRadius: 5,
            color: COLORS.red,
            fontWeight: 600,
          }}>height</code> тощо = джанк! 🔴
        </div>

      </div>
    </div>
  );
}
