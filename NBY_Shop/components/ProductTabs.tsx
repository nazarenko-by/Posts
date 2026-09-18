"use client";

import { useState } from "react";

// "Опис"/"Характеристики" — внутрішній toggle цього компонента, як і раніше.
// Епізод 10: "Відгуки · N" — реальна кількість, більше не заглушка з коментаря
// нижче. На відміну від двох перших, вона не перемикає контент тут: справжня
// секція відгуків (ReviewsSection) full-bleed нижче на сторінці товару, поза
// цим блоком, тож третя вкладка — це якірне посилання (<a href="#reviews">),
// не ще один пункт internal-стейту.
const TABS = ["Опис", "Характеристики"] as const;

export function ProductTabs({
	description,
	specs,
	reviewCount,
}: {
	description: string | null;
	specs: Record<string, string> | null;
	reviewCount: number;
}) {
	const [active, setActive] = useState<(typeof TABS)[number]>("Опис");

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-1 border-b border-border">
				{TABS.map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => setActive(tab)}
						className={`-mb-px border-b-[1.5px] px-1 py-2.5 text-[13.5px] font-medium transition-colors ${
							active === tab ? "border-fg text-fg" : "border-transparent text-fg-muted hover:text-fg"
						}`}
					>
						{tab}
					</button>
				))}
				<a
					href="#reviews"
					className="-mb-px border-b-[1.5px] border-transparent px-1 py-2.5 text-[13.5px] font-medium text-fg-muted transition-colors hover:text-fg"
				>
					Відгуки · {reviewCount}
				</a>
			</div>

			{active === "Опис" && (
				<p className="max-w-[560px] text-[13.5px] leading-[1.7] text-fg-muted">
					{description ?? "Опис товару скоро з'явиться."}
				</p>
			)}

			{active === "Характеристики" && (
				<div className="flex max-w-[560px] flex-col">
					{specs && Object.keys(specs).length > 0 ? (
						Object.entries(specs).map(([key, value]) => (
							<div
								key={key}
								className="flex justify-between border-b border-border py-2.5 text-[13px] last:border-0"
							>
								<span className="text-fg-muted">{key.replace(/_/g, " ")}</span>
								<span className="font-mono text-fg">{value}</span>
							</div>
						))
					) : (
						<p className="text-[13.5px] text-fg-muted">Характеристики скоро з&apos;являться.</p>
					)}
				</div>
			)}
		</div>
	);
}
