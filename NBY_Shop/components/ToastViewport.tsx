"use client";

import { useToast } from "@/context/ToastContext";

// Верстка 1:1 з дизайн-кіту (COMPONENTS.md → s_toast): position bottom-right
// 24px, 352px завширшки, картка з мініатюрою + текстом + опційною дією.
// pointer-events-none на контейнері й pointer-events-auto на кожній картці —
// порожній простір навколо тостів не перехоплює кліки по сторінці під ними.
export function ToastViewport() {
	const { toasts, dismissToast } = useToast();

	return (
		<div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[352px] flex-col gap-2.5">
			{toasts.map((t) => (
				<div
					key={t.id}
					className="pointer-events-auto flex gap-3 rounded-[11px] border border-border bg-bg p-3.5 shadow-lg [animation:toastIn_.25s_ease-out]"
				>
					<span
						className={`h-10 w-[34px] flex-none rounded-[6px] border ${
							t.variant === "error" ? "border-danger bg-danger-subtle" : "border-border bg-bg-muted"
						}`}
					/>
					<div className="flex flex-1 flex-col gap-[3px]">
						<span className="text-[12.5px] font-medium text-fg">{t.title}</span>
						{t.subtitle && <span className="text-[11.5px] text-fg-muted">{t.subtitle}</span>}
					</div>
					{t.action && (
						<div className="flex flex-none flex-col items-end justify-center">
							<button
								type="button"
								onClick={() => {
									t.action?.onClick();
									dismissToast(t.id);
								}}
								className="text-[11.5px] font-medium text-accent hover:underline"
							>
								{t.action.label}
							</button>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
