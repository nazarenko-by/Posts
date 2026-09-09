"use client";

import { useState } from "react";

// "Опис"/"Характеристики" з COMPONENTS.md (третя вкладка "Відгуки · N" туди ж
// у кіті, але Review-модель приходить у епізоді 10 — свідомо лишаємо тут
// тільки 2 вкладки, які вже маємо чим наповнити).
const TABS = ["Опис", "Характеристики"] as const;

export function ProductTabs({
	description,
	specs,
}: {
	description: string | null;
	specs: Record<string, string> | null;
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
