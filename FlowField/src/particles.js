const COLORS = ["#7dcfff", "#bb9af7", "#ff79c6"];

export function createParticles(count, width, height) {
  return Array.from({ length: count }, (_, i) => spawn({ color: COLORS[i % COLORS.length] }, width, height));
}

// Нова точка народження + випадкова тривалість життя, щоб частинки не зникали всі разом
export function spawn(p, width, height) {
  p.x = Math.random() * width;
  p.y = Math.random() * height;
  p.age = 0;
  p.life = 120 + Math.random() * 180;
  return p;
}

export function isDead(p, width, height) {
  return p.age > p.life || p.x < 0 || p.x > width || p.y < 0 || p.y > height;
}
