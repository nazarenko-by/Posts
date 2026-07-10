// demo/Demo.tsx — Рефакторинг живого коду #1
// Звичайне preview-демо (не Remotion): "До" (монолітний код, для порівняння)
// і "Після" (жива композиція з useProducts + ProductFilters + ProductTable +
// Pagination + ProductModal).

import React, { useState } from "react";
import { useProducts } from "./useProducts";
import { ProductFilters } from "./ProductFilters";
import { ProductTable } from "./ProductTable";
import { Pagination } from "./Pagination";
import { ProductModal } from "./ProductModal";
import { Product } from "./types";

const BEFORE_SNIPPET = `function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => { /* fetch products */ }, []);

  const filtered = products.filter(p => p.name.includes(filter));
  const sorted = [...filtered].sort((a, b) => a[sort] > b[sort] ? 1 : -1);
  const paged = sorted.slice((page - 1) * 20, page * 20);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {/* filters JSX */}
      {/* table JSX */}
      {/* pagination JSX */}
      {/* modal JSX */}
    </div>
  );
}
// ...і ще 470 рядків нижче`;

function ProductPageAfter() {
  const { products, loading, error } = useProducts();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  if (loading) return <p style={{ color: "#565f89" }}>Завантаження...</p>;
  if (error) return <p style={{ color: "#ff5f57" }}>{error}</p>;

  return (
    <div>
      <ProductFilters value={filter} onChange={setFilter} />
      <ProductTable products={products} filter={filter} onSelect={setSelected} />
      <Pagination page={1} total={1} />
      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

const TABS = [
  { id: "before", label: "До (монстр)" },
  { id: "after", label: "Після (composition)" },
] as const;

export default function Demo() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("after");

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 480 }}>
      <h2>Рефакторинг живого коду #1: ProductPage</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{ fontWeight: active === t.id ? 700 : 400 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
        {active === "before" ? (
          <pre
            style={{
              background: "#0a0d14",
              color: "#c0caf5",
              padding: 14,
              borderRadius: 6,
              fontSize: 12,
              overflowX: "auto",
              margin: 0,
            }}
          >
            {BEFORE_SNIPPET}
          </pre>
        ) : (
          <ProductPageAfter />
        )}
      </div>

      <p style={{ marginTop: 16, color: "#888", fontSize: 13 }}>
        "Після" — жива композиція: useProducts() + ProductFilters + ProductTable + Pagination + ProductModal.
      </p>
    </div>
  );
}
