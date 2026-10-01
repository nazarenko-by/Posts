import type { ReactNode } from "react";

// Епізод 16 — 1:1 з дизайн-кіту (COMPONENTS.md → "13. Empty/Error/Skeleton
// states"): 64px icon-коло (dashed border, без заливки — для нейтральних
// empty-станів; filled danger-subtle — для 500) + жирний заголовок + приглушений
// опис (max-width) + 1-2 CTA + мінімальна мono-підпис route/файл внизу
// (напр. "/cart · empty", "app/not-found.tsx"). Один компонент на всі
// empty/error екрани проєкту — раніше кожна сторінка мала свій рядок
// <p className="text-fg-muted">…</p>, тепер вигляд один і той самий.
export function EmptyState({
	icon,
	tone = "neutral",
	title,
	description,
	actions,
	caption,
}: {
	icon: ReactNode;
	tone?: "neutral" | "danger";
	title: string;
	description?: string;
	actions?: ReactNode;
	caption?: string;
}) {
	return (
		<div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-card border border-border bg-bg px-8 py-11 text-center">
			<span
				className={`grid h-16 w-16 place-items-center rounded-full ${
					tone === "danger"
						? "bg-danger-subtle text-danger"
						: "border border-dashed border-border-strong text-fg-subtle"
				}`}
			>
				{icon}
			</span>

			<div className="flex flex-col gap-2">
				<span className="text-[17px] font-semibold leading-[1.25] tracking-[-0.02em] text-fg">{title}</span>
				{description && <p className="max-w-[280px] text-[13px] leading-[1.6] text-fg-muted">{description}</p>}
			</div>

			{actions && <div className="flex flex-wrap items-center justify-center gap-2.5">{actions}</div>}

			{caption && <span className="font-mono text-[10.5px] text-fg-subtle">{caption}</span>}
		</div>
	);
}

// Іконки — той мінімальний набір, який реально потрібен цьому проєкту
// (пошук/обране/каталог/помилка), stroke-only, 24x24 viewBox — той самий
// стиль, що вже в ProductCard.tsx (heart) і кіту.
export function SearchOffIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
			<circle cx="10.5" cy="10.5" r="6.5" />
			<path d="M20 20l-4.3-4.3" />
		</svg>
	);
}

export function HeartOffIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
			<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
		</svg>
	);
}

export function BoxIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
			<path d="M3 8l9-5 9 5-9 5-9-5z" />
			<path d="M3 8v8l9 5 9-5V8" />
			<path d="M12 13v8" />
		</svg>
	);
}

export function WarningIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
			<path d="M12 3.5L2.5 20h19L12 3.5z" />
			<path d="M12 9.5v4.5" />
			<circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
		</svg>
	);
}
