# FluidType

Один заголовок трьома способами: **`40px`**, **`2.5rem`** і **`clamp()`**. Що реально бачить користувач на різних екранах, із великим шрифтом у браузері і на зумі.

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #231 · папка `FluidType`

## Запуск

```bash
npm i
npm run dev       # демо: ширина вікна, «Розмір шрифту» браузера, зум
npm run measure   # справжні заміри в Chromium (Playwright) → results.json
```

## Результат (04.11.2026, Chromium 141, Playwright 1.56)

«Бачить» = `font-size` × `devicePixelRatio`. Зум 200% = так працює Ctrl +: CSS-ширина 1440 → 720, DPR 2. «Дуже великий» шрифт = standard font size 24px (CDP `Page.setFontSizes`).

| | `40px` | `2.5rem` | `clamp(1.75rem, 1rem + 3vw, 3rem)` | `clamp(1.75rem, 1rem + 4.5vw, 3rem)` | `clamp(28px, 4vw, 48px)` |
|---|---|---|---|---|---|
| телефон 375 | 40 | 40 | 28 | 32,9 | 28 |
| планшет 768 | 40 | 40 | 39 | 48 | 30,7 |
| десктоп 1440 | 40 | 40 | 48 | 48 | 48 |
| 1440, шрифт 24px | 40 (×1) | 60 (×1,5) | 67,2 (×1,4) | 72 (×1,5) | 48 (×1) |
| 1440, зум 200% | 80 (×2) | 80 (×2) | 75,2 (×1,57) | 96 (×2) | 57,6 (×1,2) |
| 1440, зум 300% | 120 | 120 | 91,2 (×1,9) | 112,8 (×2,35) | 84 (×1,75) |

## Чому так

- **px** — не реагує на налаштування «Розмір шрифту» взагалі. Зум працює, бо зум масштабує все.
- **rem** — рахується від шрифту кореня, тому поважає і налаштування, і зум. Але не адаптується до ширини екрана.
- **clamp() з vw** — на зумі CSS-ширина вікна зменшується, тож vw-частина теж зменшується і «з'їдає» приріст. Поки шрифт не впирається в максимум, зум 200% дає менше ніж ×2. Лише vw без rem (`clamp(28px, 4vw, 48px)`) ще й ігнорує налаштування шрифту.
- **Виправлення** — нехай clamp() доходить до максимуму раніше. `1rem + 4.5vw` дорівнює `3rem` уже на ~710px CSS-ширини, тож на десктопі навіть при зумі 200% (viewport 720) шрифт на максимумі → рівно ×2.

Перевірка для свого сайту: Ctrl + до 200% — заголовки мають вирости вдвічі (WCAG 1.4.4 Resize Text).

## Файли

- `public/sample.html` — зразок із п'ятьма варіантами (його міряє скрипт і показує демо)
- `scripts/measure.mjs` — заміри в Chromium, пише `results.json`
- `index.html`, `src/main.js`, `src/style.css` — демо з повзунком ширини, шрифтом браузера і зумом (зум імітується: iframe вужчий у zoom разів + `transform: scale`)

---

EN: One heading as `40px`, `2.5rem` and `clamp(1.75rem, 1rem + 3vw, 3rem)`, measured in Chromium. px ignores the browser font-size setting; rem and clamp() respect it. At 200% zoom px and rem double, but the vw-based clamp() grows only ×1.57 — unless it reaches its max early (`1rem + 4.5vw` → max at ~710px → exactly ×2). `npm i && npm run measure`.
