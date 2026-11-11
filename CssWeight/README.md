# CssWeight

Скільки CSS (і JS) їде в браузер, якщо зверстати **ту саму сторінку** в Tailwind v4, CSS Modules і vanilla-extract. Сторінка NBY Shop: шапка, hero, 12 карток товарів, футер. Три збірки попіксельно однакові на 1280 і 390 px (`scripts/screens.mjs`).

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #238 · папка `CssWeight`

![preview](preview.png)

## Запуск

```bash
npm i
npm run dev            # Tailwind
npm run dev:modules    # CSS Modules
npm run dev:vanilla    # vanilla-extract
npm run bench          # 4 збірки × 3 → results.json
node scripts/screens.mjs   # скріни + попіксельне порівняння
```

## Результат (11.11.2026)

Vite 8.3.8, React 19.3.1, Tailwind 4.3.5, vanilla-extract 1.21.3. Медіана з 3 збірок.

| | CSS | CSS gzip | CSS brotli | JS gzip | CSS + JS gzip | `vite build` |
|---|---|---|---|---|---|---|
| Tailwind v4 | 15,3 KB | **3,8 KB** | 3,3 KB | 68,5 KB | 72,3 KB | 495 ms |
| CSS Modules | 5,0 KB | 1,6 KB | 1,3 KB | 68,2 KB | 69,7 KB | 459 ms |
| vanilla-extract | 4,7 KB | 1,4 KB | 1,2 KB | 67,9 KB | 69,3 KB | 679 ms |
| Tailwind, порожня сторінка | 4,0 KB | 1,4 KB | 1,2 KB | — | — | — |

- **Tailwind** віддає найбільше CSS. 1,4 KB gzip — це preflight і змінні теми ще до першого класу (`src/tailwind-base`). Ще +0,3 KB gzip іде в JS: довгі рядки класів у JSX.
- **CSS Modules і vanilla-extract** майже однакові. Обидва генерують звичайний CSS, а vanilla-extract до того ж трохи компактніше мінімізує.
- **Разом із JS** різниця — 3 KB на 70 KB сторінки.
- **Білд:** vanilla-extract виконує `.css.ts` під час збірки і найповільніший.

### Пастка Tailwind v4: автосканування

Без `source(none)` Tailwind сканує весь проєкт і генерує класи зі слів у будь-яких файлах. Тут він знаходив `grid`, `flex` і подібні слова у файлах двох інших варіантів. Результат — 17,9 KB / 4,15 KB gzip замість 15,3 / 3,8, тобто +9% gzip. Тому в `src/tailwind/style.css`:

```css
@import "tailwindcss" source(none);
@source "./";
```

## Чесно

- Це одна сторінка. На великому застосунку атомарні класи Tailwind повторно використовуються і ростуть повільніше, ніж CSS компонентів. Тут це не міряно.
- Reset у CSS Modules і vanilla-extract мінімальний і написаний вручну. Preflight у Tailwind повніший, і він рахується у вазі Tailwind.

## Файли

- `src/tailwind`, `src/modules`, `src/vanilla` — три реалізації; `src/tailwind-base` — порожня сторінка з Tailwind
- `src/data.js` — товари й посилання (однакові)
- `vite.config.js` — `VARIANT=tailwind | modules | vanilla | tailwind-base`
- `scripts/bench.mjs` — збірки, розміри, час; `scripts/screens.mjs` — скріни й порівняння

---

EN: One NBY Shop page built three ways, pixel-identical. CSS gzip: Tailwind v4 3.8 KB (1.4 KB of it is preflight + theme), CSS Modules 1.6 KB, vanilla-extract 1.4 KB. CSS + JS: 72.3 / 69.7 / 69.3 KB. Build: 495 / 459 / 679 ms. Without `source(none)`, Tailwind scanned unrelated files and shipped +9% CSS. `npm i && npm run bench`.
