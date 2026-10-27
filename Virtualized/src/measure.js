// Заміри: вузли DOM у списку, час від render() до першого кадру, FPS під час прокрутки
export const mountStart = performance.now();

export const countNodes = (el) => (el ? el.getElementsByTagName("*").length : 0);

// чекаємо кадр після коміту - це момент, коли список уже намальовано
export const afterPaint = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

// програмно прокручує список за duration мс і рахує кадри
export async function scrollBench(el, duration = 3000) {
  const start = performance.now();
  const max = el.scrollHeight - el.clientHeight;
  const frames = [];
  let last = start;
  await new Promise((resolve) => {
    function step(now) {
      frames.push(now - last);
      last = now;
      const p = Math.min((now - start) / duration, 1);
      el.scrollTop = max * p;
      if (p < 1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
  frames.shift();
  const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
  return {
    fps: Math.round(1000 / avg),
    longFrames: frames.filter((f) => f > 50).length,
    worstMs: Math.round(Math.max(...frames)),
  };
}
