// Одна зірка-SVG використовується і на ProductCard (епізод 1), і в буй-боксі
// товару, і тут — раніше кожне місце малювало свій <svg>, тепер один компонент.
// Заповнені зірки — перші Math.floor(rating) штук, решта outline (1:1 з кітом:
// "5-star rating row = inline SVG stars, last one outline-only for partial rating").
const STAR_PATH = "M12 2l3 6.6 7 .8-5.2 4.8 1.4 7-6.2-3.5L5.8 21l1.4-7L2 9.4l7-.8z";

export function RatingStars({ rating, size = 12 }: { rating: number; size?: number }) {
	const filled = Math.floor(rating);

	return (
		<span className="inline-flex items-center gap-[2px]" style={{ color: "var(--color-star)" }}>
			{Array.from({ length: 5 }, (_, i) => (
				<svg
					key={i}
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill={i < filled ? "currentColor" : "none"}
					stroke="currentColor"
					strokeWidth={i < filled ? 0 : 1.6}
				>
					<path d={STAR_PATH} />
				</svg>
			))}
		</span>
	);
}
