import { createGauge } from "./gauge.js";
import { createDonut } from "./donut.js";

const updateGauge = createGauge(document.getElementById("gauge"), { target: 80 });
const updateDonut = createDonut(document.getElementById("donut"));

// умовні дані - заміни на свій fetch
function randomData() {
  const total = 30;
  const done = 10 + Math.floor(Math.random() * 18);
  const inProgress = Math.floor(Math.random() * (total - done));
  return {
    plan: Math.round(40 + Math.random() * 60),
    tasks: [
      { label: "готово", count: done },
      { label: "в роботі", count: inProgress },
      { label: "черга", count: total - done - inProgress },
    ],
  };
}

function refresh() {
  const { plan, tasks } = randomData();
  updateGauge(plan);
  updateDonut(tasks);
}

refresh();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) setInterval(refresh, 3000);
document.getElementById("refresh").addEventListener("click", refresh);
