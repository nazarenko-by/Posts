import { useState } from "react";
import { Shader, LinearGradient, Circle, GlassTiles } from "shaders/react";
import { useOrbit } from "./useOrbit.js";

export default function Hero() {
  const center = useOrbit();
  // Немає WebGPU → <Shader> лишає canvas прозорим і один раз викликає onUnavailable.
  // Під canvas завжди лежить звичайний CSS-градієнт (.hero), тож сторінка виглядає нормально.
  const [fallback, setFallback] = useState(null);

  return (
    <section className="hero">
      <Shader
        className="hero__canvas"
        disableTelemetry
        onUnavailable={(reason) => setFallback(String(reason))}
      >
        {/* шари малюються по черзі, кожен поверх попередніх → один <canvas> */}
        <LinearGradient colorA="#0f172a" colorB="#7c3aed" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        <Circle color="#ff0088" radius={0.35} softness={0.15} center={center} />
        <GlassTiles tileCount={12} intensity={2} roundness={0.2} />
      </Shader>

      <div className="hero__content">
        <p className="hero__eyebrow">@nby.frontend · Shaders</p>
        <h1>Живий фон без WGSL</h1>
        <p>3 компоненти → 3 шари → 1 &lt;canvas&gt;</p>
        {fallback && (
          <p className="hero__fallback">WebGPU недоступний ({fallback}) - показуємо CSS-фон</p>
        )}
      </div>
    </section>
  );
}
