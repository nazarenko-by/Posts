import { prisma } from "@/lib/prisma";
import { ProductsTable } from "@/components/admin/ProductsTable";

// Епізод 15 — Server Component: реальний список товарів з Prisma, без
// фейкового пагінатора (кіт малює "1—5 / 128", у нас каталог маленький —
// чесніше показати справжню кількість, ніж імітувати сторінки, яких нема).
export default async function AdminProductsPage() {
	const [products, categoryGroups] = await Promise.all([
		prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
		prisma.product.groupBy({ by: ["category"] }),
	]);
	const categories = categoryGroups.map((g) => g.category).sort();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-[20px] font-semibold text-fg">Товари</h1>
				<span className="font-mono text-[11px] text-fg-subtle">{products.length} товарів</span>
			</div>

			<ProductsTable products={products} categories={categories} />
		</div>
	);
}
