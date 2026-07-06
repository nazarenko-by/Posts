import { createContext, useContext, useState, ReactNode } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<Theme>("dark");

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider pattern: the theme "lives" at the top of the tree.
 * Any descendant can read it via useTheme() — no prop drilling
 * through components that don't care about the theme themselves.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useState<Theme>("dark");
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
