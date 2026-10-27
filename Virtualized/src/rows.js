// 100 000 рядків «логів» - детерміновано, без Math.random, щоб заміри повторювались
const LEVELS = ["info", "warn", "error", "debug"];
const SERVICES = ["api", "auth", "cart", "search", "payments", "cdn"];

export const ROW_COUNT = 100_000;
export const ROW_HEIGHT = 36;

export const rows = Array.from({ length: ROW_COUNT }, (_, i) => ({
  id: i + 1,
  level: LEVELS[(i * 7) % 4],
  service: SERVICES[(i * 13) % 6],
  ms: (i * 37) % 900 + 20,
}));
