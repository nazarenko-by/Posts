# ClientBundleDiff

Скільки JS тримають на сервері Server Components у NBY Shop. Той самий магазин збирається двічі: «як є» і з `"use client"` у кожному файлі, який зараз серверний і міг би бути клієнтським. Потім порівнюється JS кожної сторінки.

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #234 · папка `ClientBundleDiff`

## Запуск

```bash
npm i
# потрібна база з товарами: generateStaticParams читає її під час next build
DATABASE_URL=postgresql://... AUTH_SECRET=... npm run bench -- ../ShopProject 3
```

`scripts/bench.mjs`:

1. Копіює проєкт у тимчасову папку і додає `productionBrowserSourceMaps: true`.
2. Робить `next build` × 3 «як є» і рахує JS кожної сторінки (`scripts/analyze.mjs` з поста #233 `BundleMap`).
3. Дописує `"use client"` у 10 файлів зі списку `CLIENT_FILES`.
4. Знову робить `next build` × 3 і пише `results.json` (медіана й розкид між збірками). `asis.json` і `allclient.json` містять повну розкладку по пакетах і файлах.

JS сторінки — це спільний рантайм плюс чанки всіх сегментів маршруту, тобто те, що браузер вантажить при першому відкритті. Розміри мінімізовані, у KiB.

## Результат (05.11.2026)

Next.js 16.3.5 (Turbopack), по 3 збірки. Розкид між збірками: JS 0 байт, gzip до 8 байт.

| сторінка | як є | усе `"use client"` | різниця | gzip |
|---|---|---|---|---|
| `/` | 525,7 KB | 567,0 KB | **+41,3** (+8%) | +13,7 |
| `/search` | 522,5 | 562,5 | +40,1 | +13,7 |
| `/wishlist` | 525,9 | 563,2 | +37,3 | +12,6 |
| `/account` | 519,4 | 556,1 | +36,7 | +12,5 |
| `/product/[slug]` | 553,7 | 565,0 | +11,3 | +4,3 |
| `/admin/products` | 558,9 | 566,9 | +8,1 | +3,4 |
| `/checkout` | 921,8 | 958,5 | +36,7 | +12,5 |
| `/auth` | 937,5 | 945,6 | +8,1 | +3,4 |

Склад добавки на головній: **tailwind-merge + cva + clsx — 27,6 KB**, мої компоненти — 13,1 KB, решта 0,6 KB.

`/auth` і `/checkout` важкі через zod. Причину й фікс розібрано в #233 (`BundleMap`).

## Чому так

- `components/ui/button.tsx` — це `cva` + `cn()` (tailwind-merge). Поки `Hero` серверний, `buttonVariants({ size: "lg" })` виконується на сервері, і в HTML потрапляє готовий рядок класів. Щойно ці файли стають `"use client"`, tailwind-merge (~27 KB) їде в браузер разом із кнопкою.
- На `/product` і `/admin` кнопки вже стоять у клієнтських компонентах (`BuyBoxActions`, `ProductsTable`), тож tailwind-merge там і так завантажений. Додаються лише мої компоненти, +8–11 KB.
- Висновок: Server Components економлять рівно стільки, скільки важать їхні імпорти. Невеликі компоненти з розміткою дають кілька KB, а бібліотека, яку тягне один серверний компонент, дає десятки.

## Файли

- `scripts/bench.mjs` — дві збірки × 3 і порівняння, пише `results.json`
- `scripts/analyze.mjs` — сторінки → чанки → пакети (source maps)
- `results.json`, `asis.json`, `allclient.json` — заміри для ShopProject

---

EN: NBY Shop built as-is and with `"use client"` added to 10 server files. Home page JS: 525.7 → 567.0 KB (+8%, gzip +13.7 KB), two thirds of it tailwind-merge + cva behind `buttonVariants()`. Pages whose buttons are already client components grow only 8–11 KB. `npm i && npm run bench -- <path-to-next-app>`.
