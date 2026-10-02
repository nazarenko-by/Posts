import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState, SearchOffIcon } from "@/components/EmptyState";

// Епізод 17 — robots: noindex. Результати пошуку — тонкий/дубльований
// контент, що вже є в каталозі з фільтрами (app/page.tsx); індексувати
// кожен можливий `?q=` немає сенсу.
export const metadata: Metadata = {
	title: "Пошук",
	robots: { index: false, follow: false },
};

// Епізод 5 — сторінка результатів пошуку. Наступний крок у search params-конвенції,
// вже знайомій з episode 4 (params: Promise<{ slug }>): у Next 16 searchParams теж
// приходить як Promise, тому await перед читанням.
//
// Затримка запиту — не мокова "0.42s" з дизайн-кіту, а справжній performance.now()
// навколо prisma.product.findMany. Кіт малював цифру для вигляду; тут вона реальна
// і змінюється залежно від запиту.
//
// Вимір винесено в окрему async-функцію поза компонентом: eslint-правило
// react-hooks/purity (нове в eslint-config-next 16) забороняє викликати
// "нечисті" функції (performance.now, Date.now, Math.random) прямо в тілі
// компонента/хука — але звичайна допоміжна функція під це правило не підпадає.
async function searchProducts(query: string) {
	const start = performance.now();
	const products = await prisma.product.findMany({
		where: {
			status: "PUBLISHED",
			title: { contains: query, mode: "insensitive" },
		},
		orderBy: { createdAt: "desc" },
	});
	const latencyMs = performance.now() - start;
	return { products, latencyMs };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
	const { q } = await searchParams;
	const query = (q ?? "").trim();

	const { products, latencyMs } =
		query.length > 0
			? await searchProducts(query)
			: { products: [] as Awaited<ReturnType<typeof prisma.product.findMany>>, latencyMs: 0 };

	// Категорії для чипсів під порожнім результатом пошуку — та сама ідея, що
	// кіт (COMPONENTS.md → s_states, "Empty search"): не просто "нічого не
	// знайдено", а конкретна підказка куди піти далі.
	const categoryGroups =
		query.length > 0 && products.length === 0
			? await prisma.product.groupBy({ by: ["category"], where: { status: "PUBLISHED" } })
			: [];

	return (
		<div className="mx-auto max-w-6xl px-6 py-10">
			<nav className="mb-6 flex items-center gap-2 font-mono text-[12px] text-fg-subtle">
				<Link href="/" className="hover:text-fg">
					Головна
				</Link>
				<span>/</span>
				<span className="text-fg-muted">Пошук</span>
			</nav>

			{query.length === 0 ? (
				<p className="text-fg-muted">Введи запит у полі пошуку в шапці.</p>
			) : (
				<>
					<div className="mb-8 flex flex-wrap items-baseline gap-3">
						<h1 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-fg">
							Результати для «{query}»
						</h1>
						<span className="font-mono text-[12.5px] text-fg-subtle">
							{products.length} {products.length === 1 ? "товар" : "товарів"} · {latencyMs.toFixed(1)} мс
						</span>
					</div>

					{products.length === 0 ? (
						<EmptyState
							icon={<SearchOffIcon />}
							title="Нічого не знайдено"
							description={`За запитом «${query}» нічого нема. Спробуй іншу назву або обери категорію нижче.`}
							actions={categoryGroups.map((g) => (
								<Link
									key={g.category}
									href={`/?category=${encodeURIComponent(g.category)}`}
									className="rounded-badge border border-border px-3 py-1.5 font-mono text-[12px] text-fg-muted no-underline hover:border-accent hover:text-accent"
								>
									{g.category}
								</Link>
							))}
							caption="app/search/page.tsx · empty"
						/>
					) : (
						<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
							{products.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
