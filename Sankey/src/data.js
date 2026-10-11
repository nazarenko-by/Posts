// Умовні дані: джерело трафіку → сторінка входу → результат.
// Завдяки nodeId(d => d.name) у links пишемо назви, а не індекси.
export const data = {
  nodes: [
    { name: "Google" },
    { name: "Instagram" },
    { name: "Direct" },
    { name: "Головна" },
    { name: "Блог" },
    { name: "Ціни" },
    { name: "Реєстрація" },
    { name: "Пішли" },
  ],
  links: [
    { source: "Google", target: "Головна", value: 1200 },
    { source: "Google", target: "Блог", value: 2400 },
    { source: "Google", target: "Ціни", value: 600 },
    { source: "Instagram", target: "Головна", value: 1500 },
    { source: "Instagram", target: "Блог", value: 700 },
    { source: "Instagram", target: "Ціни", value: 400 },
    { source: "Direct", target: "Головна", value: 500 },
    { source: "Direct", target: "Ціни", value: 900 },
    { source: "Головна", target: "Реєстрація", value: 700 },
    { source: "Головна", target: "Пішли", value: 2500 },
    { source: "Блог", target: "Реєстрація", value: 600 },
    { source: "Блог", target: "Пішли", value: 2500 },
    { source: "Ціни", target: "Реєстрація", value: 1100 },
    { source: "Ціни", target: "Пішли", value: 800 },
  ],
};
