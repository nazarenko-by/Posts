"use client";

import { useEffect } from "react";
import Link from "next/link";
import { EmptyState, WarningIcon } from "@/components/EmptyState";

// Епізод 16 — error.tsx: Next.js App Router конвенція для error boundary
// (обов'язково "use client" — сам boundary рендериться на клієнті, навіть
// якщо помилка сталась у Server Component вище). reset() — спроба
// перерендерити сегмент без повного reload сторінки; той самий рядок,
// що в кіті: "error.tsx · reset()". filled danger-subtle коло замість
// dashed-нейтрального — 1:1 з s_states (COMPONENTS.md).
//
// console.error тут — не для дебагу в цьому демо (нема Sentry/подібного
// сервісу підключеного), а сам факт логування помилки перед показом
// fallback-UI — те, що очікує реальний error.tsx.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="mx-auto flex max-w-6xl px-6 py-20">
			<EmptyState
				icon={<WarningIcon />}
				tone="danger"
				title="Щось пішло не так"
				description="Сторінка не змогла завантажитись. Спробуй ще раз — якщо не допоможе, повернись на головну."
				actions={
					<>
						<button
							type="button"
							onClick={reset}
							className="inline-flex h-9 cursor-pointer items-center rounded-control border border-border bg-bg px-4 font-mono text-[12.5px] font-medium text-fg"
						>
							Спробувати знову
						</button>
						<Link
							href="/"
							className="inline-flex h-9 items-center rounded-control px-4 font-mono text-[12.5px] font-medium text-fg-muted no-underline hover:text-fg"
						>
							На головну
						</Link>
					</>
				}
				caption="error.tsx · reset()"
			/>
		</div>
	);
}
