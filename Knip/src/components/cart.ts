import { formatPrice, total, type Item } from "../utils/format.ts";

export function renderCart(items: Item[]): string {
  return `${items.length} товар(и) на ${formatPrice(total(items))}`;
}
