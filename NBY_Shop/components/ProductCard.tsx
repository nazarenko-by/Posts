import type { Product } from "@prisma/client";
import { formatUAH } from "@/lib/format";

// Верстка 1:1 з дизайн-кіту (ShopProject/COMPONENTS.md → ProductCard.dc.html),
// перекладена з inline-стилів на Tailwind-класи, що читають наші токени
// (bg-muted, border, text-fg-muted, rounded-card...) з app/globals.css.
// Wishlist-кнопка поки без onClick — інтерактивність приходить у епізоді 9.

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex cursor-pointer flex-col gap-3">
      <div
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-card border border-border bg-bg-muted transition-colors group-hover:border-border-strong"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 11px, rgba(127,127,127,.055) 11px 22px)",
        }}
      >
        <span className="font-mono text-[10.5px] font-medium tracking-[0.08em] text-fg-subtle">
          IMG 4:5
        </span>

        {product.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-badge bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent-fg">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          aria-label="Додати в обране"
          className="absolute right-2 top-2 grid h-[30px] w-[30px] place-items-center rounded-control border border-border bg-bg text-fg-muted transition-colors hover:border-accent hover:text-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-[5px]">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.09em] text-fg-subtle">
          {product.category}
        </span>
        <span className="text-[14.5px] font-medium leading-[1.35] tracking-[-0.01em] text-fg">
          {product.title}
        </span>
        <div className="mt-[3px] flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-fg">
            {formatUAH(product.priceUAH)}
          </span>
          {product.compareAt && (
            <span className="font-mono text-[12.5px] text-fg-subtle line-through">
              {formatUAH(product.compareAt)}
            </span>
          )}
          <span className="flex-1" />
          <span className="flex items-center gap-[3px] font-mono text-[11.5px] font-medium text-fg-muted">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--color-star)" stroke="none">
              <path d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7-6.2-3.5L5.8 21l1.4-7L2 9.4l7-.8z" />
            </svg>
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
