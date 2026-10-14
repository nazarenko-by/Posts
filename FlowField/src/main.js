import { createField } from "./field.js";
import { createParticles, spawn, isDead } from "./particles.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const BG = "10, 13, 20";
const SPEED = 2;

let width, height, particles;
const field = createField();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let paused = reduceMotion;
let t = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = `rgb(${BG})`;
  ctx.fillRect(0, 0, width, height);
  // кількість частинок - від площі екрана
  particles = createParticles(Math.round((width * height) / 600), width, height);
}

// один крок симуляції + малювання
function step() {
    // напівпрозорий фон замість clearRect: старі лінії тьмяніють - так і виходять сліди
    ctx.fillStyle = `rgba(${BG}, 0.08)`;
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 1.4;

    for (const p of particles) {
      const a = field.angle(p.x, p.y, t);
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      p.x += Math.cos(a) * SPEED;
      p.y += Math.sin(a) * SPEED;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      p.age++;
      if (isDead(p, width, height)) spawn(p, width, height);
    }
    t++;
}

function frame() {
  if (!paused) step();
  requestAnimationFrame(frame);
}

window.addEventListener("resize", resize);
canvas.addEventListener("click", () => {
  field.reseed();
  ctx.fillStyle = `rgb(${BG})`;
  ctx.fillRect(0, 0, width, height);
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    paused = !paused;
  }
});

resize();
// без анімації (prefers-reduced-motion): одразу проганяємо 200 кроків - статична картинка, пробіл запускає рух
if (reduceMotion) for (let i = 0; i < 200; i++) step();
requestAnimationFrame(frame);
