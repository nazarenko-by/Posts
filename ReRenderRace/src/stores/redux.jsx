// Redux Toolkit: useSelector порівнює результат селектора, useDispatch - стабільна функція.
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";

const shop = createSlice({
  name: "shop",
  initialState: { user: "Богдан", count: 0, theme: "dark" },
  reducers: {
    add: (s) => { s.count += 1; },
    theme: (s) => { s.theme = s.theme === "dark" ? "light" : "dark"; },
  },
});

const store = configureStore({ reducer: shop.reducer });

export function ReduxStore({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

export const reduxHooks = {
  useUser: () => useSelector((s) => s.user),
  useCount: () => useSelector((s) => s.count),
  useTheme: () => useSelector((s) => s.theme),
  useAddToCart: () => { const d = useDispatch(); return () => d(shop.actions.add()); },
  useToggleTheme: () => { const d = useDispatch(); return () => d(shop.actions.theme()); },
};
