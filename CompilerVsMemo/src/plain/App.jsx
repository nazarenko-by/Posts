// Варіант без ручної мемоізації: так пишуть, коли не думають про ре-рендери.
// Цей самий файл збирається двічі: звичайним Vite і з React Compiler.
import { Profiler, useState } from "react";
import { PRODUCTS } from "../data.js";
import { onCardRender, onListRender } from "../stats.js";

const fmt = new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 });

function ProductCard({ product, onAdd }) {
    return (
        <Profiler id="card" onRender={onCardRender}>
            <li className="card">
                <b>{product.name}</b>
                <span>{product.category} · ★ {product.rating}</span>
                <span className="price">{fmt.format(product.price)}</span>
                <button onClick={() => onAdd(product.id)}>у кошик</button>
            </li>
        </Profiler>
    );
}

function ProductList({ query, sort, onAdd }) {
    // «дорога» частина: фільтр + сортування 5000 товарів
    const q = query.trim().toLowerCase();
    const visible = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q))
        .sort((a, b) => (sort === "price" ? a.price - b.price : b.rating - a.rating || a.name.localeCompare(b.name, "uk")));
    return (
        <Profiler id="list" onRender={onListRender}>
            <p className="muted">знайдено: {visible.length}</p>
            <ul className="grid">
                {visible.slice(0, 200).map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
            </ul>
        </Profiler>
    );
}

export default function App() {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("rating");
    const [note, setNote] = useState("");
    const [cart, setCart] = useState([]);
    const onAdd = (id) => setCart((c) => [...c, id]);
    return (
        <main>
            <div className="bar">
                <input id="query" placeholder="пошук" value={query} onChange={(e) => setQuery(e.target.value)} />
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="rating">за рейтингом</option>
                    <option value="price">за ціною</option>
                </select>
                <input id="note" placeholder="нотатка до замовлення" value={note} onChange={(e) => setNote(e.target.value)} />
                <span>у кошику: {cart.length}</span>
            </div>
            <ProductList query={query} sort={sort} onAdd={onAdd} />
        </main>
    );
}
