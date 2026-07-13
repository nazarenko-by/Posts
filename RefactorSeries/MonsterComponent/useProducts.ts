// useProducts.ts — Рефакторинг живого коду #1
// Custom hook: витягнутий фетчинг + loading/error стан.
// В "монстрі" це жило прямо в ProductPage; тепер — окремо, тестується незалежно.

import { useEffect, useState } from "react";
import { Product } from "./types";

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Клавіатура механічна", price: 2400, category: "periphery" },
  { id: 2, name: "Монітор 27\" 144Hz", price: 8900, category: "displays" },
  { id: 3, name: "Мишка бездротова", price: 950, category: "periphery" },
  { id: 4, name: "USB-C хаб", price: 1200, category: "accessories" },
  { id: 5, name: "Веб-камера 1080p", price: 1600, category: "periphery" },
  { id: 6, name: "Підставка для ноутбука", price: 700, category: "accessories" },
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // імітація мережевого запиту
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return { products, loading, error };
}
