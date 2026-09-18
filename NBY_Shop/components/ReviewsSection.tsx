import { RatingStars } from "@/components/RatingStars";
import type { RatingStat } from "@/lib/reviews";

// Верстка 1:1 з кіту (COMPONENTS.md → s_product, "Reviews section"): full-bleed
// bg-subtle секція під буй-боксом/вкладками, 300px/1fr грід — зліва середнє +
// розподіл по зірках, справа картки відгуків. Full-bleed тут справжній (не
// -mx-хак): секція рендериться поза max-w-6xl контейнером сторінки товару,
// свій внутрішній mx-auto max-w-6xl вирівнює контент так само, як решта сторінки.
//
// Дані вже пораховані на сторінці (getProductReviewStats + findMany) — цей
// компонент, як ProductTabs/ProductGallery, лише презентаційний.
export function ReviewsSection({
	average,
	count,
	recommend,
	distribution,
	reviews,
}: {
	average: number;
	count: number;
	recommend: number;
	distribution: RatingStat[];
	reviews: { id: string; author: string; rating: number; comment: string; verified: boolean; createdAt: Date }[];
}) {
	return (
		<section id="reviews" className="border-t border-border bg-bg-subtle">
			<div className="mx-auto grid max-w-6xl gap-[52px] px-6 py-11 lg:grid-cols-[300px_1fr]">
				<div className="flex flex-col gap-3.5">
					<h2 className="text-[20px] font-semibold tracking-[-0.02em] text-fg">Відгуки</h2>

					<div className="flex items-end gap-3">
						<span className="font-mono text-[44px] font-semibold tracking-[-0.02em] text-fg">
							{average.toFixed(1)}
						</span>
						<span className="pb-[5px] text-[12.5px] text-fg-muted">
							{count} {count === 1 ? "відгук" : "відгуків"}
							<br />
							{recommend} рекомендують
						</span>
					</div>

					{count > 0 ? (
						<div className="flex flex-col gap-1.5">
							{distribution.map((d) => (
								<span
									key={d.star}
									className="flex items-center gap-[9px] font-mono text-[11px] text-fg-subtle"
								>
									{d.star}
									<span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-muted">
										<span
											className="block h-full bg-accent"
											style={{ width: `${(d.count / count) * 100}%` }}
										/>
									</span>
									{d.count}
								</span>
							))}
						</div>
					) : (
						<p className="text-[12.5px] text-fg-muted">Ще немає відгуків — будь першим.</p>
					)}

					<button
						type="button"
						className="h-[38px] rounded-control border border-border bg-bg text-[13px] font-medium text-fg"
					>
						Написати відгук
					</button>
				</div>

				<div className="flex flex-col gap-3">
					{reviews.length === 0 && (
						<p className="text-[13.5px] text-fg-muted">Поки що жодного відгуку про цей товар.</p>
					)}

					{reviews.map((review) => (
						<div
							key={review.id}
							className="flex flex-col gap-2.5 rounded-card border border-border bg-bg p-5"
						>
							<div className="flex items-center gap-[11px]">
								<span className="grid h-8 w-8 place-items-center rounded-full bg-bg-muted font-mono text-[11.5px] font-semibold text-fg-muted">
									{initials(review.author)}
								</span>
								<div className="flex flex-col gap-0.5">
									<span className="text-[13px] font-medium text-fg">{review.author}</span>
									<span className="font-mono text-[10.5px] text-fg-subtle">
										{formatDate(review.createdAt)}
										{review.verified ? " · підтверджена покупка" : ""}
									</span>
								</div>
								<span className="flex-1" />
								<RatingStars rating={review.rating} size={12} />
							</div>
							<p className="text-[13.5px] leading-[1.65] text-fg-muted">{review.comment}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function initials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}
