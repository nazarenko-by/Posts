// Інтерактивний острів №1: акордеон FAQ (useState)
import { useState } from "react";
import { FAQ } from "./content.js";

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {FAQ.map((item, i) => (
        <div key={item.q} className={open === i ? "qa open" : "qa"}>
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{item.q}</button>
          {open === i && <p>{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
