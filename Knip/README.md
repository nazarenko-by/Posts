# Knip

[Knip](https://knip.dev) знаходить мертвий код: файли, до яких ніхто не доходить, експорти, які ніхто не імпортує, і залежності в `package.json`, які ніде не використовуються. Він будує граф імпортів від точок входу — сам розпізнає Next.js, Vite, Astro, Prisma, ESLint та ще понад сотню інструментів через плагіни.

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #228 · папка `Knip`

## Запуск

```bash
npx knip          # звіт, без встановлення й конфігу
npx knip --fix    # прибрати знайдене (переглянь diff перед комітом!)
```

## Демо в цій папці

Маленький проєкт із навмисно залишеним «мертвим» кодом:

```bash
npm i && npm run knip
```

```
Unused files (1)
src/components/wishlist.ts
Unused dependencies (1)
lodash  package.json:12:6
Unused exports (1)
formatDate  function  src/utils/format.ts:6:17
```

- `src/components/wishlist.ts` — файл, який ніхто не імпортує;
- `lodash` — у `dependencies`, але в коді жодного `import`;
- `formatDate` — експортована функція, яку ніхто не викликає;
- тип `Item` експортований і використаний у своєму ж файлі — Knip його не чіпає, бо його імпортує `cart.ts`.

## Реальний звіт: NBY Shop (01.11.2026)

Knip 6.44.1 на магазині з серії «Магазин з нуля» (Next.js 16 + Prisma): 67 файлів `.ts/.tsx`, 109 імпортів, 19 точок входу (маршрути `app/` + `prisma/seed.ts`).

| Що | Скільки |
|---|---|
| Невикористаних файлів | 0 |
| Зайвих `dependencies` | 0 |
| Зайвих `devDependencies` | 1 — `@types/bcryptjs` (bcryptjs 3 має власні типи) |
| Невикористаних експортованих типів | 8 |

Більшість типів використовуються у своєму ж файлі — зайве лише слово `export`. З конфігом

```json
{ "ignoreExportsUsedInFile": true }
```

лишається 2: `ShippingValue` і `PaymentValue` у `lib/pricing.ts`.

## Корисне

- `npx knip --production` — перевіряє лише продакшн-код (без тестів і dev-залежностей).
- `npx knip --reporter json` — для CI або власних графіків.
- У монорепо Knip сам знаходить воркспейси з `package.json` / `pnpm-workspace.yaml`.

---

EN: Knip finds unused files, exports and dependencies by walking the import graph from your entry points. Demo project with planted dead code (`npm i && npm run knip`) plus a real report on NBY Shop: 67 files, 0 unused files/deps, 1 unused devDependency, 8 unused exported types (2 with `ignoreExportsUsedInFile`).
