# Treemap

Treemap на D3.js + React: ієрархія як вкладені прямокутники, значення «дихають» і розкладка перебудовується в реальному часі.

Код до поста 206 [@nby.frontend](https://www.instagram.com/nby.frontend/).

## Запуск

```bash
npm install
npm run dev
```

## Як працює

1. `d3.hierarchy(data).sum(d => d.value)` — будуємо ієрархію й рахуємо суми.
2. `d3.treemap().size([760, 520]).padding(3)(root)` — d3 додає кожному вузлу `x0, y0, x1, y1`.
3. React малює `root.leaves()` як `<rect>` у SVG.

Дані — в `src/data.js`, компонент — в `src/Treemap.jsx`.
