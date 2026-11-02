// formatPrice використовують, а formatDate - ні (невикористаний експорт)
export function formatPrice(kopecks: number): string {
  return `${(kopecks / 100).toFixed(2)} ₴`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("uk-UA");
}

// тип імпортує cart.ts - тому він не мертвий
export type Item = { title: string; price: number };
export const total = (items: Item[]) => items.reduce((s, i) => s + i.price, 0);
