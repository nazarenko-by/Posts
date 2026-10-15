import * as d3 from "d3";

// Відкритий API NEPTUN: без ключів і реєстрації, CORS відкритий.
// Умови: видиме посилання на https://neptun.in.ua біля карти, опитування не частіше ніж раз на 5 с.
// NEPTUN - інформаційний агрегатор, НЕ офіційна система оповіщення.
const URL = "https://neptun.in.ua/api/v1/alerts";

// Кількість районів в області (після реформи 2020 р.) - щоб відрізнити «вся область» від «частини районів»
export const RAIONS = {
  "Вінницька область": 6, "Волинська область": 4, "Дніпропетровська область": 7, "Донецька область": 8,
  "Житомирська область": 4, "Закарпатська область": 6, "Запорізька область": 5, "Івано-Франківська область": 6,
  "Київська область": 7, "Кіровоградська область": 4, "Луганська область": 8, "Львівська область": 7,
  "Миколаївська область": 4, "Одеська область": 7, "Полтавська область": 4, "Рівненська область": 4,
  "Сумська область": 5, "Тернопільська область": 3, "Харківська область": 7, "Херсонська область": 5,
  "Хмельницька область": 3, "Черкаська область": 4, "Чернівецька область": 3, "Чернігівська область": 5,
  "Автономна Республіка Крим": 10,
};
// У нашій геометрії м. Київ злитий з Київською областю, Севастополь - з АР Крим
const ALIAS = { "м. Київ": "Київська область", "Севастополь": "Автономна Республіка Крим" };

export async function fetchAlerts() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`NEPTUN ${res.status}`);
  const { updatedAt, oblasts, raions } = await res.json();

  // скільки районів кожної області зараз під тривогою
  const n = d3.rollup(raions, (v) => v.length, (r) => ALIAS[r.oblast] ?? r.oblast);
  const whole = new Map();
  for (const o of oblasts) {
    if (o.name === "м. Київ") continue; // тривога в місті ≠ тривога в усій області
    const key = ALIAS[o.name] ?? o.name;
    if (!whole.has(key) || o.since < whole.get(key)) whole.set(key, o.since);
  }
  const kyivCity = oblasts.find((o) => o.name === "м. Київ");

  const status = (name) =>
    whole.has(name) || n.get(name) === RAIONS[name]
      ? "full"
      : n.has(name) || (kyivCity && name === "Київська область") ? "part" : "none";

  return { updatedAt: new Date(updatedAt), status, since: (name) => whole.get(name) ?? null, count: (name) => n.get(name) ?? 0 };
}
