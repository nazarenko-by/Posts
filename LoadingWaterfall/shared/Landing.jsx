// Сам лендінг: статична розмітка + два інтерактивні острови (Menu, Faq)
import { FEATURES } from "./content.js";
import { Faq } from "./Faq.jsx";
import { Menu } from "./Menu.jsx";

export function Landing() {
  return (
    <>
      <header className="top">
        <strong className="logo">Launchpad</strong>
        <Menu />
      </header>
      <main>
        <section className="hero" id="start">
          <h1>Лендінг за вечір, а не за спринт</h1>
          <p>Шаблони, аналітика й команда - усе для запуску продукту в одному місці.</p>
          <a className="cta big" href="#features">Спробувати безкоштовно</a>
        </section>
        <section className="features" id="features">
          {FEATURES.map((f) => (
            <article key={f.title}><h2>{f.title}</h2><p>{f.text}</p></article>
          ))}
        </section>
        <section id="faq">
          <h2>Часті питання</h2>
          <Faq />
        </section>
      </main>
      <footer>© 2026 Launchpad · демо для @nby.frontend</footer>
    </>
  );
}
