# EnumVsUnion

Один і той самий статус замовлення (`draft | paid | shipped | cancelled`) трьома способами — **enum**, **union-тип** і **об'єкт `as const`** — і що з кожного лишається в JavaScript.

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #230 · папка `EnumVsUnion`

## Запуск

```bash
npm i
npm run build            # tsc → out/ + розміри після tsc і esbuild --minify
npm run check:erasable   # tsc з erasableSyntaxOnly
npm run run:enum         # node src/enum.ts - падає
npm run run:union        # node src/union.ts - працює
```

## Результат (03.11.2026)

TypeScript 7.0.2 (target ES2022), esbuild 0.28.2, Node 22.22:

| | enum | union | as const |
|---|---|---|---|
| сам `Status` у JS | 208 B (IIFE) | 0 B | 122 B (об'єкт) |
| файл з `isDone()` після tsc | 254 B | 46 B | 168 B |
| після `esbuild --minify` | 154 B | 46 B | 128 B |
| `node file.ts` без збірки | ✗ `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` | ✓ | ✓ |
| `erasableSyntaxOnly: true` | ✗ `TS1294` | ✓ | ✓ |

## Чому так

- **enum** — єдиний із трьох, що генерує код: tsc робить IIFE, яка заповнює об'єкт `Status`. Тому його не можна просто «стерти», і вбудований у Node запуск `.ts` (type stripping, увімкнений за замовчуванням з Node 22.18 / 23.6) його не підтримує.
- **union** — чисто тип, після компіляції від нього нічого не лишається.
- **as const** — звичайний JS-об'єкт плюс тип, виведений з нього: `(typeof Status)[keyof typeof Status]` дає той самий union. Значення можна перебрати (`Object.values(Status)`) — для селектів і валідації.

`"erasableSyntaxOnly": true` у tsconfig забороняє все, що не можна стерти: `enum`, `namespace` з кодом, parameter properties у конструкторах, `import x = require()`.

## Файли

- `src/enum.ts`, `src/union.ts`, `src/asconst.ts` — три варіанти
- `scripts/sizes.mjs` — розміри після tsc / esbuild / gzip
- `tsconfig.json`, `tsconfig.erasable.json`

---

EN: The same status type as enum, union and `as const`. After tsc 7.0: 208 / 0 / 122 bytes of JS for the declaration; Node's built-in type stripping runs union and `as const`, but enum fails with ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX. `npm i && npm run build`.
