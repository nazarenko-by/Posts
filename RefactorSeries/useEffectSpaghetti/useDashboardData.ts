// useDashboardData.ts — Рефакторинг живого коду #2
// Витягнутий фетчинг + loading стан з монолітного Dashboard.

import { useEffect, useState } from "react";

interface DashboardStats {
  visitors: number;
  errors: number;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // імітація мережевого запиту
      setData({ visitors: 128, errors: 2 });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return data;
}
