import Link from "next/link";
import { WishlistGrid } from "@/components/WishlistGrid";

// Тонка серверна оболонка — та сама структура breadcrumb, що на /search і
// /product/[slug]. Сам вміст (WishlistGrid) — клієнтський, бо обране живе
// в localStorage, а не в Prisma.
export default function WishlistPage() {
	return (
		<div className="mx-auto max-w-6xl px-6 py-10">
			<nav className="mb-6 flex items-center gap-2 font-mono text-[12px] text-fg-subtle">
				<Link href="/" className="hover:text-fg">
					Головна
				</Link>
				<span>/</span>
				<span className="text-fg-muted">Обране</span>
			</nav>

			<h1 className="mb-8 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-fg">Обране</h1>

			<WishlistGrid />
		</div>
	);
}
