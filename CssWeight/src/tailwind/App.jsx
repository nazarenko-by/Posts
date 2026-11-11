import { useState } from "react";
import { PRODUCTS, NAV, FOOTER, uah } from "../data.js";
import "./style.css";

const btn = {
    base: "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50",
    primary: "bg-accent text-bg hover:bg-accent/90",
    secondary: "border border-line bg-panel text-ink hover:border-accent",
    ghost: "text-muted hover:bg-panel hover:text-ink",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
};
const Button = ({ variant = "primary", size = "md", className = "", ...p }) => (
    <button className={`${btn.base} ${btn[variant]} ${btn[size]} ${className}`} {...p} />
);

function Header({ cart }) {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/90 px-6 py-4 backdrop-blur">
            <a href="#" className="text-xl font-extrabold tracking-tight text-ink">NBY<span className="text-accent">.shop</span></a>
            <nav className="hidden gap-6 md:flex">
                {NAV.map((n) => <a key={n} href="#" className="text-sm font-medium text-muted transition-colors hover:text-ink">{n}</a>)}
            </nav>
            <Button variant="secondary">Кошик · {cart}</Button>
        </header>
    );
}

function Hero() {
    return (
        <section className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">Мерч для фронтендерів</p>
            <h1 className="text-3xl font-extrabold leading-tight text-ink md:text-5xl">Речі, які компілюються з першого разу</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted md:text-lg">Худі, чашки й стікери для тих, хто знає, що таке ре-рендер.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg">До каталогу</Button>
                <Button size="lg" variant="ghost">Новинки тижня</Button>
            </div>
        </section>
    );
}

function ProductCard({ p, onAdd }) {
    const [liked, setLiked] = useState(false);
    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition-transform hover:-translate-y-1 hover:border-accent/60">
            {p.badge && <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-bg">{p.badge}</span>}
            <button aria-label="в обране" onClick={() => setLiked(!liked)}
                className={`absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-bg/70 text-lg backdrop-blur ${liked ? "text-accent" : "text-muted hover:text-ink"}`}>
                {liked ? "♥" : "♡"}
            </button>
            <div className="aspect-[4/5] bg-gradient-to-br from-line to-bg" />
            <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-[15px] font-semibold text-ink">{p.name}</h3>
                <div className="flex items-center justify-between text-xs text-muted">
                    <span>{p.category}</span>
                    <span>★ {p.rating}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-accent">{uah(p.price)}</span>
                    <Button onClick={onAdd}>У кошик</Button>
                </div>
            </div>
        </article>
    );
}

function Footer() {
    return (
        <footer className="mt-16 border-t border-line px-6 py-12">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
                {FOOTER.map(([h, links]) => (
                    <div key={h}>
                        <h4 className="mb-3 text-sm font-bold text-ink">{h}</h4>
                        <ul className="space-y-2">
                            {links.map((l) => <li key={l}><a href="#" className="text-sm text-muted hover:text-ink">{l}</a></li>)}
                        </ul>
                    </div>
                ))}
            </div>
            <p className="mt-10 text-center text-xs text-muted">© 2026 NBY Shop</p>
        </footer>
    );
}

export default function App() {
    const [cart, setCart] = useState(0);
    return (
        <div className="min-h-screen bg-bg font-sans text-ink antialiased">
            <Header cart={cart} />
            <Hero />
            <main className="mx-auto max-w-6xl px-6">
                <h2 className="mb-6 text-2xl font-bold text-ink">Популярне</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                    {PRODUCTS.map((p) => <ProductCard key={p.id} p={p} onAdd={() => setCart((c) => c + 1)} />)}
                </div>
            </main>
            <Footer />
        </div>
    );
}
