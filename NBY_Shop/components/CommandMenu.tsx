"use client";

import { useRouter } from "next/navigation";
import { Command, useCommandState } from "cmdk";

// Епізод 11 (Інструменти) — cmdk (Paco Coursey; той самий компонент, що стоїть
// за command menu на vercel.com). "⌘K" у ShopHeader висів декоративним <span>
// з епізоду 2 — жодна клавіша нічого не відкривала. Тут — справжній Dialog:
// ShopHeader тримає стан (open/onOpenChange) і слухає keydown, цей компонент —
// лише презентаційний рендер, той самий патерн, що ProductTabs/ReviewsSection.
//
// cmdk навмисно unstyled — весь вигляд нижче через наші Tailwind-токени,
// бібліотека дає тільки Dialog + фільтрацію + керування стрілками/Enter.
// Активний пункт позначається `aria-selected="true"` (документація cmdk) —
// звідси `aria-selected:bg-bg-muted` замість власного :hover.

function SearchItem({ onNavigate }: { onNavigate: (query: string) => void }) {
	// useCommandState — офіційний спосіб читати внутрішній стан <Command> поза
	// самим Command.Input (тут — щоб показати "Шукати «X»" лише коли є текст).
	const search = useCommandState((state) => state.search);
	if (!search.trim()) return null;

	return (
		<Command.Item
			value={`search ${search}`}
			onSelect={() => onNavigate(search)}
			className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2.5 text-[13.5px] text-fg aria-selected:bg-bg-muted"
		>
			Шукати «{search}»
		</Command.Item>
	);
}

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const router = useRouter();

	function go(href: string) {
		router.push(href);
		onOpenChange(false);
	}

	return (
		<Command.Dialog
			open={open}
			onOpenChange={onOpenChange}
			label="Швидкі команди"
			overlayClassName="fixed inset-0 z-40 bg-fg/40"
			className="fixed left-1/2 top-[16%] z-50 w-[calc(100%-32px)] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-card border border-border bg-bg shadow-lg"
		>
			<div className="flex items-center gap-2 border-b border-border px-4">
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className="flex-none text-fg-subtle"
				>
					<circle cx="11" cy="11" r="7" />
					<path d="M21 21l-4.5-4.5" />
				</svg>
				<Command.Input
					autoFocus
					placeholder="Шукай товар або команду…"
					className="h-12 flex-1 bg-transparent font-sans text-[14px] text-fg outline-none placeholder:text-fg-subtle"
				/>
				<kbd className="rounded-[4px] border border-border bg-bg-subtle px-[5px] py-[2px] font-mono text-[10px] text-fg-subtle">
					esc
				</kbd>
			</div>

			<Command.List className="max-h-[320px] overflow-y-auto p-2">
				<Command.Empty className="px-3 py-8 text-center text-[13px] text-fg-muted">
					Нічого не знайдено.
				</Command.Empty>

				<SearchItem onNavigate={(q) => go(`/search?q=${encodeURIComponent(q)}`)} />

				<Command.Group
					heading="Навігація"
					className="px-1 pb-1 pt-3 font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle"
				>
					<Command.Item
						onSelect={() => go("/")}
						className="mt-1 flex cursor-pointer items-center gap-2 rounded-control px-3 py-2.5 font-sans text-[13.5px] normal-case tracking-normal text-fg aria-selected:bg-bg-muted"
					>
						Каталог
					</Command.Item>
					<Command.Item
						onSelect={() => go("/wishlist")}
						className="mt-1 flex cursor-pointer items-center gap-2 rounded-control px-3 py-2.5 font-sans text-[13.5px] normal-case tracking-normal text-fg aria-selected:bg-bg-muted"
					>
						Обране
					</Command.Item>
				</Command.Group>
			</Command.List>
		</Command.Dialog>
	);
}
