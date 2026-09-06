import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// Спрощена версія Hero з COMPONENTS.md (s_home): eyebrow → h1 → subhead →
// 2 CTA → 3-стат смуга зліва; справа — 2 плейсхолдер-тайли замість повного
// 2×2 колажу з кіту (щоб не роздувати епізод 2 картинками, яких ще нема).

const STATS = [
	{ value: "1–2 дні", label: "доставка" },
	{ value: "14 днів", label: "повернення" },
	{ value: "4.9 / 5", label: "рейтинг" },
];

export function Hero() {
	return (
		<section className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-5 py-14 md:grid-cols-[1.05fr_.95fr] md:gap-14 md:px-10 md:py-16">
			<div className="flex flex-col gap-5">
				<span className="font-mono text-[13px] text-fg-subtle">$ npm i -g @nby/merch</span>
				<h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] text-fg md:text-[52px] md:leading-[1.05]">
					Мерч, який зрозуміє тільки твій компілятор
				</h1>
				<p className="max-w-[440px] text-[14.5px] leading-[1.65] text-fg-muted">
					Клавіатури, худі й кружки для тих, хто дебажить о другій ночі. Весь каталог зібраний прямо з бази —
					жодного мокового JSON.
				</p>

				<div className="flex flex-wrap gap-3">
					<Link href="#catalog" className={buttonVariants({ size: "lg" })}>
						До каталогу
					</Link>
					<Link href="#" className={buttonVariants({ variant: "secondary", size: "lg" })}>
						Про магазин
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					</Link>
				</div>

				<div className="mt-2 flex gap-8 border-t border-border pt-5">
					{STATS.map((s) => (
						<div key={s.label} className="flex flex-col gap-[2px]">
							<span className="font-mono text-[15px] font-semibold text-fg">{s.value}</span>
							<span className="text-[12px] text-fg-muted">{s.label}</span>
						</div>
					))}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div
					className="col-span-2 rounded-card border border-border bg-bg-subtle md:col-span-1 md:row-span-2"
					style={{
						aspectRatio: "1 / 1",
						backgroundImage:
							"repeating-linear-gradient(135deg, transparent 0 14px, rgba(127,127,127,.06) 14px 28px)",
					}}
				/>
				<div
					className="flex flex-col justify-between rounded-card bg-accent p-5 text-white"
					style={{ aspectRatio: "1 / 1" }}
				>
					<span className="font-mono text-[11px] uppercase tracking-[0.08em] opacity-80">CLI drop</span>
					<span className="text-[15px] font-medium leading-[1.3]">Замов худі не виходячи з термінала</span>
				</div>
			</div>
		</section>
	);
}
