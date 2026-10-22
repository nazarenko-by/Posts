// Context: один провайдер з усім станом. Будь-яка зміна → новий value → ре-рендер УСІХ споживачів.
import { createContext, useContext, useMemo, useReducer } from "react";

const Ctx = createContext(null);
const initial = { user: "Богдан", count: 0, theme: "dark" };

function reducer(state, action) {
  switch (action.type) {
    case "add": return { ...state, count: state.count + 1 };
    case "theme": return { ...state, theme: state.theme === "dark" ? "light" : "dark" };
    default: return state;
  }
}

export function ContextStore({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(() => ({
    ...state,
    addToCart: () => dispatch({ type: "add" }),
    toggleTheme: () => dispatch({ type: "theme" }),
  }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const contextHooks = {
  useUser: () => useContext(Ctx).user,
  useCount: () => useContext(Ctx).count,
  useTheme: () => useContext(Ctx).theme,
  useAddToCart: () => useContext(Ctx).addToCart,
  useToggleTheme: () => useContext(Ctx).toggleTheme,
};
