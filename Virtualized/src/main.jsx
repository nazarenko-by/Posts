import "./measure.js"; // першим: фіксує час старту
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./style.css";

createRoot(document.getElementById("root")).render(<App />);
