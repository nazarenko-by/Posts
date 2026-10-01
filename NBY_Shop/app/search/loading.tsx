import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

// Той самий skeleton, що app/loading.tsx — реюз компонента, не копія
// розмітки. Заголовок і breadcrumb не показуємо тут (вони залежать від
// searchParams query, якого loading.tsx не бачить) — лише те, що реально
// вантажиться: сітка результатів.
export default function SearchLoading() {
	return (
		<div className="mx-auto max-w-6xl px-6 py-10">
			<div className="mb-8 h-7 w-56 animate-pulse rounded-[6px] bg-bg-muted" />
			<ProductGridSkeleton count={8} />
		</div>
	);
}
