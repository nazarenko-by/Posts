// 12 товарів NBY Shop - однакові для всіх трьох варіантів
export const PRODUCTS = [
    ["Худі «It works on my machine»", "одяг", 1290, 4.8, "новинка"],
    ["Футболка sudo make me a sandwich", "одяг", 690, 4.6, null],
    ["Чашка console.log(coffee)", "посуд", 390, 4.9, "-20%"],
    ["Стікерпак React Hooks", "аксесуари", 120, 4.7, null],
    ["Кепка 404 Not Found", "одяг", 540, 4.3, null],
    ["Носки git push --force", "одяг", 220, 4.5, "новинка"],
    ["Блокнот TODO: refactor", "папір", 260, 4.4, null],
    ["Термос async/await", "посуд", 790, 4.8, "-20%"],
    ["Постер Event Loop", "папір", 340, 4.9, null],
    ["Рюкзак node_modules", "аксесуари", 1890, 4.2, null],
    ["Килимок для миші Vim", "аксесуари", 450, 4.6, null],
    ["Худі TypeScript strict", "одяг", 1350, 4.7, "новинка"],
].map(([name, category, price, rating, badge], i) => ({ id: i + 1, name, category, price, rating, badge }));

export const NAV = ["Каталог", "Новинки", "Знижки", "Про нас"];
export const FOOTER = [
    ["Магазин", ["Каталог", "Новинки", "Знижки", "Подарункові карти"]],
    ["Допомога", ["Доставка", "Оплата", "Повернення", "FAQ"]],
    ["Компанія", ["Про нас", "Блог", "Вакансії", "Контакти"]],
    ["Соцмережі", ["Instagram", "Threads", "GitHub", "Telegram"]],
];
export const uah = (n) => `${n.toLocaleString("uk-UA")} ₴`;
