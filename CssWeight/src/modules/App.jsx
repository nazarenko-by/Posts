import { useState } from "react";
import { PRODUCTS, NAV, FOOTER, uah } from "../data.js";
import "./global.css";
import b from "./Button.module.css";
import h from "./Header.module.css";
import hero from "./Hero.module.css";
import c from "./ProductCard.module.css";
import f from "./Footer.module.css";
import a from "./App.module.css";

const Button = ({ variant = "primary", size = "md", className = "", ...p }) => (
    <button className={`${b.base} ${b[variant]} ${b[size]} ${className}`} {...p} />
);

function Header({ cart }) {
    return (
        <header className={h.header}>
            <a href="#" className={h.logo}>NBY<span>.shop</span></a>
            <nav className={h.nav}>
                {NAV.map((n) => <a key={n} href="#" className={h.link}>{n}</a>)}
            </nav>
            <Button variant="secondary">Кошик · {cart}</Button>
        </header>
    );
}

function Hero() {
    return (
        <section className={hero.hero}>
            <p className={hero.kicker}>Мерч для фронтендерів</p>
            <h1 className={hero.title}>Речі, які компілюються з першого разу</h1>
            <p className={hero.lead}>Худі, чашки й стікери для тих, хто знає, що таке ре-рендер.</p>
            <div className={hero.actions}>
                <Button size="lg">До каталогу</Button>
                <Button size="lg" variant="ghost">Новинки тижня</Button>
            </div>
        </section>
    );
}

function ProductCard({ p, onAdd }) {
    const [liked, setLiked] = useState(false);
    return (
        <article className={c.card}>
            {p.badge && <span className={c.badge}>{p.badge}</span>}
            <button aria-label="в обране" onClick={() => setLiked(!liked)} className={`${c.like} ${liked ? c.liked : ""}`}>
                {liked ? "♥" : "♡"}
            </button>
            <div className={c.image} />
            <div className={c.body}>
                <h3 className={c.name}>{p.name}</h3>
                <div className={c.meta}>
                    <span>{p.category}</span>
                    <span>★ {p.rating}</span>
                </div>
                <div className={c.footer}>
                    <span className={c.price}>{uah(p.price)}</span>
                    <Button onClick={onAdd}>У кошик</Button>
                </div>
            </div>
        </article>
    );
}

function Footer() {
    return (
        <footer className={f.footer}>
            <div className={f.grid}>
                {FOOTER.map(([title, links]) => (
                    <div key={title}>
                        <h4 className={f.heading}>{title}</h4>
                        <ul className={f.links}>
                            {links.map((l) => <li key={l}><a href="#" className={f.link}>{l}</a></li>)}
                        </ul>
                    </div>
                ))}
            </div>
            <p className={f.copy}>© 2026 NBY Shop</p>
        </footer>
    );
}

export default function App() {
    const [cart, setCart] = useState(0);
    return (
        <div>
            <Header cart={cart} />
            <Hero />
            <main className={a.main}>
                <h2 className={a.heading}>Популярне</h2>
                <div className={a.grid}>
                    {PRODUCTS.map((p) => <ProductCard key={p.id} p={p} onAdd={() => setCart((n) => n + 1)} />)}
                </div>
            </main>
            <Footer />
        </div>
    );
}
