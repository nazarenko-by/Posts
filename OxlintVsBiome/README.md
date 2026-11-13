# OxlintVsBiome

ESLint + Prettier, Biome і Oxlint + Oxfmt на одному справжньому проєкті - NBY Shop (Next.js 16, 69 файлів для лінту, 73 для форматування): скільки часу займає перевірка і які правила переїдуть.

> Пост [@nby.frontend](https://instagram.com/nby.frontend) #240 · папка `OxlintVsBiome` · продовження #239 (`BiomeVsEslint`)

## Як повторити на своєму проєкті

```bash
cd my-app
npm i -D oxlint oxfmt @oxlint/migrate
node node_modules/@oxlint/migrate/dist/bin/oxlint-migrate.mjs eslint.config.mjs --details   # → .oxlintrc.json
npx oxfmt --migrate=prettier                                                                  # → .oxfmtrc.json
npx oxlint .
npx oxfmt --check

cd ../OxlintVsBiome
taskset -c 0,1 node scripts/bench.mjs ../my-app 7   # 2 ядра; eslint, prettier, biome, oxlint, oxfmt → results.json
```

Для порівняння потрібні також `eslint`, `prettier`, `@biomejs/biome` з їхніми конфігами (`biome migrate eslint/prettier`, див. #239).

## Результат (12.11.2026)

ESLint 9.39.5, Prettier 3.9.8, Biome 2.6.7, Oxlint 1.93.0, Oxfmt 0.78.0. Linux, 2 ядра (`taskset -c 0,1`), Node 22, медіана з 7:

| команда | час |
|---|---|
| `eslint .` | 2 767 ms |
| `eslint --cache .` (теплий кеш) | 650 ms |
| `prettier --check .` | 936 ms |
| **ESLint + Prettier** | **3 703 ms** |
| `biome lint .` | 83 ms |
| `biome format .` | 42 ms |
| **`biome check .`** | **88 ms** |
| `oxlint .` | 35 ms |
| `oxfmt --check` | 92 ms |
| **Oxlint + Oxfmt** | **127 ms** |

- Лінт: Oxlint у **79×** швидший за ESLint і у **2,4×** за Biome.
- Формат: Biome (42 ms) швидший за Oxfmt (92 ms) у 2,2× на цьому розмірі проєкту; Oxfmt швидший за Prettier у 10×.
- Увесь конвеєр: ESLint + Prettier → Oxlint + Oxfmt у 29×, → `biome check` у 42×.

## Правила

ESLint вмикає для `.tsx` 87 правил. `@oxlint/migrate` створив 80 правил, пропустив 7 (`react/jsx-uses-react`, `react/jsx-uses-vars`, `react/no-deprecated`, `react-hooks/config`, `react-hooks/gating`, `react/require-render-return` - nursery, `@next/next/no-location-assign-relative-destination`). Biome переніс 51 (див. #239). Oxlint має правила React Compiler (`purity`, `refs`, `immutability`, `set-state-in-effect`...) і 21 правило Next.js; у Biome їх немає. Повний звіт міграції - [`migrate-oxlint.log`](migrate-oxlint.log), конфіги - [`.oxlintrc.json`](.oxlintrc.json), [`.oxfmtrc.json`](.oxfmtrc.json), [`biome.json`](biome.json).

## Що знайшли

- Oxlint, як і ESLint, дав 1 попередження (`no-console` у `prisma/seed.ts`) і читає `// eslint-disable`. Biome - 6 попереджень (4 нові `useExhaustiveDependencies` через ігнор `eslint-disable`).
- `oxfmt --check` на коді, відформатованому Prettier, - 0 відмінностей. Форматер Biome відрізняється у 2 файлах (`components/ui/button.tsx`, `package.json`).
- `app/globals.css` у ShopProject має зламаний коментар (`--color-*/` закриває його достроково): Prettier мовчки «форматує» сміття, Biome і Oxfmt показують syntax error. У копії для замірів коментар виправлено.

## Файли

- `scripts/bench.mjs` - заміри, `results.json`
- `.oxlintrc.json`, `.oxfmtrc.json`, `biome.json`, `migrate-oxlint.log` - конфіги й звіт міграції для NBY Shop

---

EN: ESLint + Prettier vs Biome vs Oxlint + Oxfmt on a real Next.js app: lint 2767 / 83 / 35 ms. Oxlint ported 80 of 87 ESLint rules (incl. React Compiler ones) and honours eslint-disable; Oxfmt matches Prettier on all files but is slower than Biome's formatter at this size.
