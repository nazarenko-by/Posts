import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Hero from "./Hero.jsx";
import "./style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Hero />
  </StrictMode>,
);
