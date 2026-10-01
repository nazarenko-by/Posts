import { Hero } from "@/components/Hero";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

// Епізод 16 — Next.js App Router loading.tsx-конвенція: Next автоматично
// показує цей файл, поки app/page.tsx (async Server Component) чекає на
// Promise.all(...) з Prisma-запитами. Hero — статичний (не залежить від
// даних), тож рендериться реальним, а не skeleton-ом; лише сітка товарів —
// та частина, що реально чекає на мережу/БД — замінена на
// ProductGridSkeleton. Ніякого спінера на весь екран (правило кіту, s_states).
export default function HomeLoading() {
	return (
		<>
			<Hero />

			<section className="mx-auto max-w-6xl px-6 py-16">
				<h2 className="mb-8 text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-fg">Каталог</h2>
				<ProductGridSkeleton count={8} />
			</section>
		</>
	);
}
