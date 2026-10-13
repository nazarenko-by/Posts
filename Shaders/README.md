# Shaders

Hero-секція з живим WebGPU-фоном на [Shaders](https://shaders.com) (MIT): `LinearGradient` + `Circle` + `GlassTiles` в одному `<Shader>`.
Коло повільно рухається (React state → пропи шейдера), скло його «ламає».

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #212 · ключ `Shaders`

## Запуск

```bash
npm i && npm run dev
```

Потрібен браузер з WebGPU (Chrome / Edge 113+). Без нього canvas прозорий — видно звичайний CSS-градієнт, сторінка працює.

## Як це працює

1. `<Shader>` створює один `<canvas>` і рендер-цикл. Діти — шари: малюються по черзі, кожен поверх попередніх.
2. `GlassTiles` — фільтр: спотворює все, що під ним.
3. Пропи (`center` у `Circle`) оновлюються на наступному кадрі без перекомпіляції — тому анімація це просто `useState` + `requestAnimationFrame` (`src/useOrbit.js`). `prefers-reduced-motion` вимикає рух.
4. Fallback: у `.hero` є звичайний `background`, а `onUnavailable` один раз повідомляє, чому WebGPU не стартував.
5. `disableTelemetry` — у пакеті є вбудований модуль телеметрії (`shaders/core/telemetry`); у демо його вимкнено пропом на `<Shader>`.

## Файли

- `src/Hero.jsx` — `<Shader>` і шари
- `src/useOrbit.js` — рух кола
- `src/style.css` — hero + CSS-fallback

---

EN: Live WebGPU hero background with Shaders (LinearGradient + Circle + GlassTiles), CSS fallback when WebGPU is unavailable. `npm i && npm run dev`.
