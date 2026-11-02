import { createApi } from "./api.js";

const failBox = document.querySelector("#fail");
const NAMES = ["user", "orders", "recs"];
const TITLES = { user: "Профіль", orders: "Замовлення", recs: "Рекомендації" };

function column(id) {
  const root = document.querySelector(`#${id}`);
  const logEl = root.querySelector(".log");
  const screen = root.querySelector(".screen");
  logEl.innerHTML = "";
  screen.innerHTML = `<p class="muted">завантаження…</p>`;
  const log = (msg) => logEl.insertAdjacentHTML("beforeend", `<div>${msg}</div>`);
  return { screen, log };
}

const card = (name, value) => `<div class="card"><i class="ok"></i><b>${TITLES[name]}</b><span>${value}</span></div>`;
const errorCard = (name) =>
  `<div class="card bad"><i class="err"></i><b>${TITLES[name]}</b><button data-retry="${name}">спробувати ще</button></div>`;

// ❌ Promise.all: перша ж відмова - і весь результат втрачено
async function loadAll() {
  const { screen, log } = column("all");
  const api = createApi({ failOrders: () => failBox.checked, log });
  try {
    const [user, orders, recs] = await Promise.all(NAMES.map(api.call));
    log(`<b>await → готово · ${api.elapsed()} ms</b>`);
    screen.innerHTML = card("user", user) + card("orders", orders) + card("recs", recs);
  } catch (err) {
    log(`<b class="red">await → reject · ${api.elapsed()} ms</b> (${err.message})`);
    screen.innerHTML = `<div class="fatal">⚠️ Щось пішло не так</div>`;
  }
}

// ✅ Promise.allSettled: чекаємо всіх, показуємо все, що вдалося
async function loadSettled() {
  const { screen, log } = column("settled");
  const api = createApi({ failOrders: () => failBox.checked, log });
  const results = await Promise.allSettled(NAMES.map(api.call));
  log(`<b>await → готово · ${api.elapsed()} ms</b>`);
  screen.innerHTML = results
    .map((r, i) => (r.status === "fulfilled" ? card(NAMES[i], r.value) : errorCard(NAMES[i])))
    .join("");
}

// повтор лише для того запиту, що впав
document.querySelector("#settled").addEventListener("click", async (e) => {
  const name = e.target.dataset?.retry;
  if (!name) return;
  e.target.disabled = true;
  e.target.textContent = "…";
  const api = createApi({ failOrders: () => failBox.checked, log: () => {} });
  const cardEl = e.target.closest(".card");
  try {
    cardEl.outerHTML = card(name, await api.call(name));
  } catch {
    e.target.disabled = false;
    e.target.textContent = "спробувати ще";
  }
});

document.querySelector("#load").addEventListener("click", () => { loadAll(); loadSettled(); });
loadAll();
loadSettled();
