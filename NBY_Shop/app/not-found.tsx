import Link from "next/link";

// Епізод 16 — not-found.tsx: Next.js App Router конвенція, підхоплюється
// автоматично і на виклик notFound() (як у app/product/[slug]/page.tsx,
// епізод 4 — DRAFT/неіснуючі slug'и), і на будь-який реальний 404-роут.
// Кіт (COMPONENTS.md → s_states): гігантський 56px mono "404" в --accent
// замість іконки-кола (єдиний empty/error стан без icon-circle), 2 CTA
// (Home / Contact us у кіті — тут чесно замінено на Home / Каталог, бо
// сторінки "Contact us" в цьому демо-проєкті нема).
export default function NotFound() {
	return (
		<div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center gap-4 px-6 py-20 text-center">
			<span className="font-mono text-[56px] font-bold leading-none tracking-[-0.03em] text-accent">404</span>

			<div className="flex flex-col gap-2">
				<span className="text-[17px] font-semibold leading-[1.25] tracking-[-0.02em] text-fg">
					Сторінку не знайдено
				</span>
				<p className="max-w-[280px] text-[13px] leading-[1.6] text-fg-muted">
					Товар знято з продажу або посилання застаріле.
				</p>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-2.5">
				<Link
					href="/"
					className="inline-flex h-9 items-center rounded-control bg-fg px-4 font-mono text-[12.5px] font-medium text-bg no-underline"
				>
					На головну
				</Link>
				<Link
					href="/#catalog"
					className="inline-flex h-9 items-center rounded-control border border-border px-4 font-mono text-[12.5px] font-medium text-fg no-underline"
				>
					Каталог
				</Link>
			</div>

			<span className="font-mono text-[10.5px] text-fg-subtle">app/not-found.tsx</span>
		</div>
	);
}
