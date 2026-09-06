import Link from "next/link";

// 4-колонковий футер 1:1 з COMPONENTS.md (grid 1.4fr 1fr 1fr 1fr):
// лого+about, Магазин/Допомога/Соцмережі, нижня смуга з copyright і
// реальним стек-креditом "Next.js · Prisma · PostgreSQL".

const COLUMNS = [
	{
		title: "Магазин",
		links: ["Каталог", "Новинки", "Розпродаж", "Подарункові картки"],
	},
	{
		title: "Допомога",
		links: ["Доставка й оплата", "Повернення", "Розмір/фіт", "Контакти"],
	},
	{
		title: "Соцмережі",
		links: ["Instagram", "Threads", "GitHub"],
	},
];

export function Footer() {
	return (
		<footer className="border-t border-border bg-bg">
			<div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
				<div className="col-span-2 flex flex-col gap-3 md:col-span-1">
					<div className="flex items-center gap-[9px]">
						<span className="grid h-7 w-7 place-items-center rounded-[8px] bg-accent font-mono text-[9px] font-bold text-white">
							NBY
						</span>
						<span className="text-[15.5px] font-semibold tracking-[-0.02em] text-fg">NBY Shop</span>
					</div>
					<p className="max-w-[260px] text-[13px] leading-[1.6] text-fg-muted">
						Мерч для тих, хто читає стектрейси на дозвіллі. Навчальний проєкт серії «Магазин з нуля».
					</p>
				</div>

				{COLUMNS.map((col) => (
					<div key={col.title} className="flex flex-col gap-3">
						<span className="text-[13px] font-semibold text-fg">{col.title}</span>
						<ul className="flex flex-col gap-2">
							{col.links.map((label) => (
								<li key={label}>
									<Link href="#" className="text-[13px] text-fg-muted no-underline hover:text-fg">
										{label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>

			<div className="border-t border-border">
				<div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-5 text-[12px] text-fg-subtle md:flex-row md:items-center md:justify-between md:px-10">
					<span>© 2026 NBY Shop — всі права захищено</span>
					<span className="font-mono">Next.js · Prisma · PostgreSQL</span>
				</div>
			</div>
		</footer>
	);
}
