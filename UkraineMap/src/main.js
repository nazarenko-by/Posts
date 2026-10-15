import { ukraineMap } from "./map.js";

const map = await ukraineMap(
  document.getElementById("chart"),
  document.getElementById("tooltip"),
  document.getElementById("status"),
);

for (const btn of document.querySelectorAll("[data-mode]")) {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    map.setMode(btn.dataset.mode);
  });
}
