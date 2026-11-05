# BundleMap

Що насправді вантажить браузер на кожній сторінці мого NBY Shop: клієнтський JS реального `next build`, розкладений на пакети й файли за source maps, і treemap на D3.

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #233 · папка `BundleMap`

## Запуск

```bash
npm i
npm run dev        # treemap: маршрут → пакет → файл, «як є» / «після фіксу»
```

Свій проєкт (Next.js з Turbopack):

```bash
# у next.config проєкту: productionBrowserSourceMaps: true
next build
npm run analyze -- ../my-app               # → bundle.json
npm run analyze -- ../my-app-fixed bundle.after.json
```

`scripts/analyze.mjs` бере `rootMainFiles` з `.next/build-manifest.json` і `entryJSFiles` усіх сегментів маршруту з `page_client-reference-manifest.js`. Тобто рахує JS, який браузер вантажить при першому відкритті сторінки. Polyfill-чанк (`nomodule`) не рахується. Кожен чанк розкладається `source-map-explorer` на вихідні файли (мінімізовані байти), gzip рахується по чанках цілком.

## Результат (05.11.2026)

ShopProject: Next.js 16.3.5 (Turbopack), react-dom 19.3.0, zod 4.6.5.

| маршрут | JS | gzip |
|---|---|---|
| `/` | 525,7 KB | 159,1 KB |
| `/account` | 519,4 KB | 156,8 KB |
| `/admin/products` | 558,9 KB | 169,3 KB |
| **`/auth`** | **937,5 KB** | **257,3 KB** |
| **`/checkout`** | **921,8 KB** | **251,0 KB** |
| `/product/[slug]` | 553,7 KB | 168,1 KB |
| `/search` | 522,5 KB | 158,1 KB |
| `/wishlist` | 525,9 KB | 159,2 KB |

`/auth` за пакетами: zod 381,0 · next 243,6 · react-dom 203,6 · cmdk + radix 46,2 · tailwind-merge 26,6 · мій код 23,7 · react 8,1 · next-themes 3,2 · інше 1,6 KB.

## Звідки zod у браузері

`components/AuthForm.tsx` (`"use client"`) імпортує з `lib/auth-schema.ts` лише константу:

```ts
import { initialAuthState, type AuthState } from "@/lib/auth-schema";
```

У `auth-schema.ts` на верхньому рівні стоять `import { z } from "zod"` і `z.object(...)`. Бандлер не може довести, що ці виклики без побічних ефектів, тому весь zod (разом із локалями) їде в клієнтський чанк. `CheckoutForm.tsx` робить те саме з `checkout-schema.ts`. `ProductForm.tsx` імпортує лише тип (`import type`), тому `/admin/products` без zod.

**Фікс** ([`fix/form-state.ts`](fix/form-state.ts)): початкові стани форм винести у файл без zod, типи брати через `import type`:

```ts
import type { AuthState } from "@/lib/auth-schema";
import { initialAuthState } from "@/lib/form-state";
```

| | до | після |
|---|---|---|
| `/auth` | 937,5 KB (gzip 257,3) | 555,2 KB (gzip 168,6) |
| `/checkout` | 921,8 KB (gzip 251,0) | 538,4 KB (gzip 161,9) |

Серверна валідація в Server Actions не змінилась: схеми й далі в `*-schema.ts`, просто не потрапляють у клієнт.

## Файли

- `scripts/analyze.mjs` — маршрути → чанки → вихідні файли, пише `bundle.json`
- `bundle.json`, `bundle.after.json` — результати для ShopProject до й після фіксу
- `fix/form-state.ts` — файл фіксу
- `index.html`, `src/main.js`, `src/style.css` — treemap (d3-hierarchy), клік по пакету — заглибитись у файли

---

EN: Real `next build` of my shop, every client chunk mapped back to packages via source maps. The /auth page shipped 937.5 KB of JS, 381 KB of it zod, imported only for an initial-state constant from a schema file. Moving the constant to a zod-free file: 555 KB (gzip 257 → 169 KB).
