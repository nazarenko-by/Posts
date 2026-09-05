/**
 * Ціни завжди зберігаються в Prisma як Int-копійки (priceUAH), ніколи float.
 * Форматуємо в гривні тільки тут, на виході — правило з DESIGN_SYSTEM.md.
 */
export function formatUAH(kopecks: number): string {
  const hryvnias = kopecks / 100;
  return `${hryvnias.toLocaleString("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} ₴`;
}
