import React, { useState, useEffect, useRef } from "react";

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

const COMPARISONS = [
  {
    name: "SVG",
    label: "SVG — Вектор",
    description: "Масштабується, стилізується, доступний",
    pros: [
      "Масштабується без втрати якості",
      "Легко стилізувати CSS/JS",
      "Доступний для скрін-рідерів",
      "Малий розмір файлу",
    ],
    cons: [
      "Повільно з великою кількістю елементів",
      "Не підходить для фотографій",
      "Складно з фільтрами",
    ],
    useCases: ["Логотипи", "Іконки", "Схеми", "Діаграми"],
    color: "#7dcfff",
  },
  {
    name: "Canvas",
    label: "Canvas — Растр",
    description: "Швидко, динамічно, пікселі",
    pros: [
      "Швидкий для великої кількості пікселів",
      "Анімації в реальному часі",
      "GPU прискорення",
      "Змішування кольорів, фільтри",
    ],
    cons: [
      "Складно з текстом",
      "Не масштабується без перерендеру",
      "Важко отримати координати",
    ],
    useCases: ["Ігри", "Частинки", "Графіки", "Лоадери"],
    color: "#bb9af7",
  },
  {
    name: "WebGL",
    label: "WebGL — 3D",
    description: "Потужно, 3D, GPU на повну",
    pros: [
      "Повна GPU потужність",
      "3D графіка",
      "Кастомні шейдери",
      "Найшвидший на складних сценах",
    ],
    cons: [
      "Складна для вивчення",
      "Складний код",
      "Потребує шейдерів",
      "Меньше браузерної підтримки",
    ],
    useCases: ["3D сцени", "VR", "Складні ефекти", "Data visualization"],
    color: "#9ece6a",
  },
];

function SVGDemo() {
  return (
    <svg width="100%" height="200" viewBox="0 0 300 200" style={{ background: COLORS.surface2, borderRadius: 8 }}>
      {/* Анімовані кола */}
      <defs>
        <style>{`
          @keyframes svgPulse {
            0%, 100% { r: 30; opacity: 0.3; }
            50% { r: 45; opacity: 0.1; }
          }
          @keyframes svgFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
        `}</style>
      </defs>
      
      {/* Коло 1 */}
      <circle cx="75" cy="100" r="30" fill="#7dcfff" opacity="0.5" />
      <circle cx="75" cy="100" r="30" fill="none" stroke="#7dcfff" strokeWidth="2" style={{ animation: "svgPulse 2s infinite" }} />
      
      {/* Коло 2 */}
      <circle cx="150" cy="100" r="35" fill="#bb9af7" opacity="0.5" />
      <circle cx="150" cy="100" r="35" fill="none" stroke="#bb9af7" strokeWidth="2" style={{ animation: "svgPulse 2s infinite 0.3s" }} />
      
      {/* Коло 3 */}
      <circle cx="225" cy="100" r="25" fill="#9ece6a" opacity="0.5" />
      <circle cx="225" cy="100" r="25" fill="none" stroke="#9ece6a" strokeWidth="2" style={{ animation: "svgPulse 2s infinite 0.6s" }} />
      
      {/* Текст */}
      <text 
        x="150" 
        y="190" 
        textAnchor="middle" 
        fill={COLORS.text} 
        fontSize="12" 
        fontWeight="600"
        fontFamily="'JetBrains Mono', monospace"
      >
        SVG: Вектор + Анімація
      </text>
    </svg>
  );
}

function CanvasDemo() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    let animationId;
    let time = 0;

    const animate = () => {
      ctx.fillStyle = COLORS.surface2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.05;

      // Малюємо частинки
      for (let i = 0; i < 3; i++) {
        const x = (canvas.width / 4) + i * (canvas.width / 4);
        const y = 100 + Math.sin(time + i) * 30;
        const radius = 20 + Math.cos(time + i) * 10;

        ctx.fillStyle = ["#7dcfff", "#bb9af7", "#9ece6a"][i];
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = COLORS.text;
      ctx.font = "12px 'JetBrains Mono'";
      ctx.textAlign = "center";
      ctx.fillText("Canvas: Растр + Динаміка", canvas.width / 2, 190);

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: 200,
        background: COLORS.surface2,
        borderRadius: 8,
        display: "block",
      }}
    />
  );
}

function WebGLDemo() {
  return (
    <div
      style={{
        width: "100%",
        height: 200,
        background: COLORS.surface2,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: COLORS.text,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Анімований 3D фон */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0.3,
        }}
        viewBox="0 0 300 200"
      >
        <defs>
          <style>{`
            @keyframes rotate3d {
              0% { transform: rotateX(0deg) rotateY(0deg); }
              100% { transform: rotateX(360deg) rotateY(360deg); }
            }
          `}</style>
        </defs>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={50 + i * 80}
            y="50"
            width="50"
            height="100"
            fill="none"
            stroke={["#7dcfff", "#bb9af7", "#9ece6a"][i]}
            strokeWidth="2"
            style={{
              animation: `rotate3d ${2 + i * 0.5}s linear infinite`,
            }}
          />
        ))}
      </svg>

      {/* Текст */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent, marginBottom: 4 }}>
          3D
        </div>
        <div>WebGL: 3D + Шейдери</div>
      </div>
    </div>
  );
}

export default function SVGCanvasWebGLDemo() {
  const [selectedTech, setSelectedTech] = useState("SVG");

  const currentTech = COMPARISONS.find((t) => t.name === selectedTech);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        padding: "50px 30px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "50px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* ─── HEADER ─── */}
        <div style={{ marginBottom: 60, marginTop: 5, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 46,
              fontWeight: 700,
              margin: 0,
              color: COLORS.accent,
            }}
          >
            ⚔️ SVG vs Canvas vs WebGL
          </h1>
          <p
            style={{
              fontSize: 15,
              color: COLORS.muted,
              marginTop: 14,
              lineHeight: 1.6,
            }}
          >
            Коли що використовувати? Повний розбір
          </p>
        </div>

        {/* ─── TECH SELECTOR ─── */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 28,
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: COLORS.green,
              fontWeight: 600,
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            🎯 Вибери технологію:
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            {COMPARISONS.map((tech) => (
              <button
                key={tech.name}
                onClick={() => setSelectedTech(tech.name)}
                style={{
                  padding: "16px 14px",
                  borderRadius: 10,
                  border: `2px solid ${
                    selectedTech === tech.name ? tech.color : COLORS.border
                  }`,
                  background:
                    selectedTech === tech.name
                      ? tech.color + "22"
                      : COLORS.surface2,
                  color:
                    selectedTech === tech.name ? tech.color : COLORS.text,
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
                <span>{tech.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: COLORS.muted,
                    fontWeight: 400,
                  }}
                >
                  {tech.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── DEMO PREVIEW ─── */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            overflow: "hidden",
            marginTop: 5,
            marginBottom: 5,
            boxShadow: `0 0 60px ${currentTech?.color}11`,
          }}
        >
          <div
            style={{
              background: COLORS.surface2,
              padding: "14px 20px",
              borderBottom: `1px solid ${COLORS.border}`,
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            🎬 Live Demo — {currentTech?.label}
          </div>

          <div style={{ padding: "32px 24px" }}>
            {selectedTech === "SVG" && <SVGDemo />}
            {selectedTech === "Canvas" && <CanvasDemo />}
            {selectedTech === "WebGL" && <WebGLDemo />}
          </div>
        </div>

        {/* ─── PROS & CONS ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          {/* Pros */}
          <div
            style={{
              background: `${COLORS.green}11`,
              border: `1px solid ${COLORS.green}33`,
              borderRadius: 12,
              padding: 24,
              fontSize: 13,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: COLORS.green,
                fontWeight: 600,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              ✅ Переваги
            </div>
            <div style={{ color: COLORS.text, lineHeight: 2 }}>
              {currentTech?.pros.map((pro, i) => (
                <div key={i}>• {pro}</div>
              ))}
            </div>
          </div>

          {/* Cons */}
          <div
            style={{
              background: `${COLORS.red}11`,
              border: `1px solid ${COLORS.red}33`,
              borderRadius: 12,
              padding: 24,
              fontSize: 13,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: COLORS.red,
                fontWeight: 600,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              ❌ Недоліки
            </div>
            <div style={{ color: COLORS.text, lineHeight: 2 }}>
              {currentTech?.cons.map((con, i) => (
                <div key={i}>• {con}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── USE CASES ─── */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 28,
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: COLORS.yellow,
              fontWeight: 600,
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            🎯 Коли використовувати:
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {currentTech?.useCases.map((useCase, i) => (
              <div
                key={i}
                style={{
                  padding: 14,
                  background: COLORS.surface2,
                  borderRadius: 8,
                  border: `1px solid ${currentTech?.color}33`,
                  fontSize: 12,
                  color: currentTech?.color,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {useCase}
              </div>
            ))}
          </div>
        </div>

        {/* ─── COMPARISON TABLE ─── */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            overflow: "hidden",
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div
            style={{
              background: COLORS.surface2,
              padding: "14px 20px",
              borderBottom: `1px solid ${COLORS.border}`,
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            📊 Порівняльна таблиця
          </div>

          <div
            style={{
              padding: 24,
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 12,
                      color: COLORS.yellow,
                      fontWeight: 600,
                    }}
                  >
                    Параметр
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: 12,
                      color: "#7dcfff",
                      fontWeight: 600,
                    }}
                  >
                    SVG
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: 12,
                      color: "#bb9af7",
                      fontWeight: 600,
                    }}
                  >
                    Canvas
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: 12,
                      color: "#9ece6a",
                      fontWeight: 600,
                    }}
                  >
                    WebGL
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { param: "Масштабування", svg: "✓", canvas: "✗", webgl: "✓" },
                  { param: "Швидкість", svg: "✗", canvas: "✓", webgl: "✓✓" },
                  { param: "CSS стилізація", svg: "✓", canvas: "✗", webgl: "✗" },
                  { param: "3D", svg: "✗", canvas: "▲", webgl: "✓" },
                  { param: "Доступність", svg: "✓", canvas: "✗", webgl: "✗" },
                  { param: "Легкість", svg: "✓", canvas: "▲", webgl: "✗" },
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      background: i % 2 === 0 ? COLORS.surface2 : "transparent",
                    }}
                  >
                    <td style={{ padding: 12, color: COLORS.text }}>
                      {row.param}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        textAlign: "center",
                        color: "#7dcfff",
                      }}
                    >
                      {row.svg}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        textAlign: "center",
                        color: "#bb9af7",
                      }}
                    >
                      {row.canvas}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        textAlign: "center",
                        color: "#9ece6a",
                      }}
                    >
                      {row.webgl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── TIP ─── */}
        <div
          style={{
            background: COLORS.surface2,
            border: `1px solid ${COLORS.yellow}44`,
            borderRadius: 12,
            padding: 28,
            fontSize: 14,
            color: COLORS.text,
            lineHeight: 1.8,
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <span style={{ color: COLORS.yellow, fontWeight: 600, fontSize: 15 }}>
            💡 Золоте правило:
          </span>
          <br />
          Не обирай WebGL тому що воно "крутіше". Обирай інструмент за завданням!
          <br />
          SVG для логотипів, Canvas для ігор, WebGL для 3D. Простота вирішення —
          це перемога 🎯
        </div>

      </div>
    </div>
  );
}
