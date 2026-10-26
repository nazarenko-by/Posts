import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./style.css";

// Без StrictMode: він навмисно рендерить двічі в dev, а ми рахуємо справжні рендери
createRoot(document.getElementById("root")).render(<App />);
