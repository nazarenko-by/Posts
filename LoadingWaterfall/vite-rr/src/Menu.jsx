// Інтерактивний острів №2: мобільне меню (useState)
import { useState } from "react";

export function Menu() {
  const [open, setOpen] = useState(false);
  return (
    <nav className={open ? "menu open" : "menu"}>
      <button className="burger" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      <ul>
        <li><a href="#features">Можливості</a></li>
        <li><a href="#faq">Питання</a></li>
        <li><a href="#start" className="cta">Почати</a></li>
      </ul>
    </nav>
  );
}
