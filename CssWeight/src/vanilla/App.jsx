import { useState } from "react";
import { PRODUCTS, NAV, FOOTER, uah } from "../data.js";
import * as s from "./styles.css.ts";

const Button = ({ variant = "primary", size = "md", className = "", ...p }) => (
    <button className={`${s.btnBase} ${s.btnVariant[variant]} ${s.btnSize[size]} ${className}`} {...p} />
);

function Header({ cart }) {
    return (
        <header className={s.header}>
            <a href="#" className={s.logo}>NBY<span className={s.logoAccent}>.shop</span></a>
            <nav className={s.nav}>
                {NAV.map((n) => <a key={n} href="#" className={s.navLink}>{n}</a>)}
            </nav>
            <Button variant="secondary">Кошик · {cart}</Button>
        </header>
    );
}

function Hero() {
    return (
        <section className={s.hero}>
            <p className={s.kicker}>Мерч для фронтендерів</p>
            <h1 className={s.heroTitle}>Речі, які компілюються з першого разу</h1>
            <p className={s.lead}>Худі, чашки й стікери для тих, хто знає, що таке ре-рендер.</p>
            <div className={s.heroActions}>
                <Button size="lg">До каталогу</Button>
                <Button size="lg" variant="ghost">Новинки тижня</Button>
            </div>
        </section>
    );
}

function ProductCard({ p, onAdd }) {
    const [liked, setLiked] = useState(false);
    return (
        <article className={s.card}>
            {p.badge && <span className={s.badge}>{p.badge}</span>}
            <button aria-label="в обране" onClick={() => setLiked(!liked)} className={`${s.like} ${liked ? s.liked : ""}`}>
                {liked ? "♥" : "♡"}
            </button>
            <div className={s.image} />
            <div className={s.cardBody}>
                <h3 className={s.cardName}>{p.name}</h3>
                <div className={s.meta}>
                    <span>{p.category}</span>
                    <span>★ {p.rating}</span>
                </div>
                <div className={s.cardFooter}>
                    <span className={s.price}>{uah(p.price)}</span>
                    <Button onClick={onAdd}>У кошик</Button>
                </div>
            </div>
        </article>
    );
}

function Footer() {
    return (
        <footer className={s.footer}>
            <div className={s.footerGrid}>
                {FOOTER.map(([title, links]) => (
                    <div key={title}>
                        <h4 className={s.footerHeading}>{title}</h4>
                        <ul className={s.footerLinks}>
                            {links.map((l) => <li key={l}><a href="#" className={s.footerLink}>{l}</a></li>)}
                        </ul>
                    </div>
                ))}
            </div>
            <p className={s.copy}>© 2026 NBY Shop</p>
        </footer>
    );
}

export default function App() {
    const [cart, setCart] = useState(0);
    return (
        <div>
            <Header cart={cart} />
            <Hero />
            <main className={s.main}>
                <h2 className={s.sectionHeading}>Популярне</h2>
                <div className={s.grid}>
                    {PRODUCTS.map((p) => <ProductCard key={p.id} p={p} onAdd={() => setCart((n) => n + 1)} />)}
                </div>
            </main>
            <Footer />
        </div>
    );
}
