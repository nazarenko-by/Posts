// 5000 детермінованих товарів (той самий набір у всіх варіантах)
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const WORDS = ["футболка", "худі", "чашка", "стікер", "кепка", "носки", "рюкзак", "блокнот", "термос", "постер"];
const TAGS = ["react", "node", "css", "ts", "vite", "next", "d3", "git", "npm", "bun"];
const CATS = ["одяг", "посуд", "аксесуари", "папір"];

export const PRODUCTS = Array.from({ length: 5000 }, (_, i) => ({
    id: i + 1,
    name: `${WORDS[Math.floor(rnd() * WORDS.length)]} ${TAGS[Math.floor(rnd() * TAGS.length)]} #${i + 1}`,
    category: CATS[Math.floor(rnd() * CATS.length)],
    price: Math.round(150 + rnd() * 1850),
    rating: Math.round((3 + rnd() * 2) * 10) / 10,
}));
