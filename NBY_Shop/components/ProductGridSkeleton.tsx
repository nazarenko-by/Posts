// Епізод 16 — skeleton для сітки товарів, 1:1 з ProductCard.tsx (той самий
// aspect-[4/5] rounded-card border), не абстрактний прямокутник — кіт явно
// вимагає цього (COMPONENTS.md → s_states): "Skeleton має повторювати реальну
// сітку: та сама аспектність зображення (4:5), та сама висота рядків тексту.
// Ніяких спінерів на всю сторінку — тільки локальні skeleton-и й кнопки в
// стані loading." Ширина текстових смуг варіюється по картці (i % 3) для
// менш механічного вигляду — той самий прийом, що в кіті.
const TITLE_WIDTHS = ["80%", "65%", "72%"];

function SkeletonCard({ i }: { i: number }) {
	return (
		<div className="flex flex-col gap-3">
			<span
				className="aspect-[4/5] rounded-card bg-bg-muted"
				style={{
					backgroundImage: "linear-gradient(90deg, transparent, rgba(127,127,127,.13), transparent)",
					backgroundSize: "160px 100%",
					backgroundRepeat: "no-repeat",
					animation: "shimmer 1.4s infinite linear",
				}}
			/>
			<span className="h-[9px] w-[38%] rounded-[5px] bg-bg-muted" />
			<span className="h-3 rounded-[5px] bg-bg-muted" style={{ width: TITLE_WIDTHS[i % 3] }} />
			<span className="h-3 w-[34%] rounded-[5px] bg-bg-muted" />
		</div>
	);
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div
			className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
			aria-busy="true"
			aria-label="Завантаження товарів"
		>
			{Array.from({ length: count }, (_, i) => (
				<SkeletonCard key={i} i={i} />
			))}
		</div>
	);
}
