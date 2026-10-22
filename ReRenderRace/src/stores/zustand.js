// Zustand: компонент підписаний лише на свій шматок стану через селектор.
import { create } from "zustand";

export const useShop = create((set) => ({
  user: "Богдан",
  count: 0,
  theme: "dark",
  addToCart: () => set((s) => ({ count: s.count + 1 })),
  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
}));

export const zustandHooks = {
  useUser: () => useShop((s) => s.user),
  useCount: () => useShop((s) => s.count),
  useTheme: () => useShop((s) => s.theme),
  useAddToCart: () => useShop((s) => s.addToCart),
  useToggleTheme: () => useShop((s) => s.toggleTheme),
};
