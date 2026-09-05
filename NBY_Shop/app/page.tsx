import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

// Async Server Component — жодного useEffect/useState, жодного /api/products.
// Next.js рендерить цю сторінку на сервері, дані вже готові в першому HTML-кадрі.
// Header/hero/footer — це епізод 2 (UI-фундамент), тут навмисно тільки каталог.
export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-8 text-[32px] font-semibold leading-[1.15] tracking-[-0.03em] text-fg">
        Каталог
      </h1>

      {products.length === 0 ? (
        <p className="text-fg-muted">
          Товарів поки немає — запусти <code className="font-mono">npm run db:seed</code>.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
