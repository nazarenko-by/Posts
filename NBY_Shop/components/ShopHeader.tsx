"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandMenu } from "@/components/CommandMenu";
import { useDebounce } from "@/hooks/useDebounce";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

// Переклад ShopHeader.dc.html (NBY Shop (Design)/ShopHeader.dc.html) з inline-стилів
// на Tailwind-класи наших токенів. Структура 1:1 з кітом: announcement strip →
// logo + nav + search + wishlist/cart. Додано те, чого нема в дизайн-кіті (кіт —
// статичний макет): мобільне бургер-меню, бо "responsive layout" — це власне
// тема епізоду 2, а не самого кіту.
//
// wishlist — епізод 9: реальний лічильник з useWishlist(), кнопка веде на
// нову сторінку /wishlist. cart — епізод 7: реальний лічильник з useCart(),
// кнопка веде на /checkout (епізод 11) — окремої сторінки /cart немає,
// order summary в чекауті і є тим самим переглядом кошика перед оплатою.
// suppressHydrationWarning на обох числах — SSR завжди віддає 0 (localStorage
// нема на сервері), клієнт одразу після гідратації показує справжнє
// значення; той самий принцип, що next-themes у епізоді 3.
//
// Пошук (епізод 5) — раніше декоративний <span>, тепер реальний контрольований
// input. useDebounce (300ms) — той самий hook, що вже був на слайдах постів
// 169-170 — гасить проміжні onChange під час набору: на /search відправляється
// лише "заспокоєне" значення, а не кожна натиснута клавіша. Мобільна кнопка-іконка
// поки лише відкриває/закриває (реальний mobile search overlay — поза скоупом
// епізоду).
//
// ⌘K (епізод 11, Інструменти) — бейдж поруч із пошуком висів з епізоду 2
// суто декоративним <span>, жодна клавіша нічого не відкривала. Слухач
// keydown живе тут (ShopHeader вже клієнтський і вже тримає local state),
// сам палет — презентаційний CommandMenu.tsx.
//
// Акаунт (епізод 14) — іконка завжди веде на /account: сторінка сама
// серверна й сама редіректить на /auth, якщо немає сесії. ShopHeader —
// клієнтський компонент і навмисно не тримає власного auth-стану (не хочемо
// зайвого запиту сесії з клієнта заради самої лише іконки в шапці).

const NAV_LINKS = [
	{ href: "/", label: "Каталог" },
	{ href: "#", label: "Про нас" },
	{ href: "#", label: "Блог" },
];

export function ShopHeader() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [cmdkOpen, setCmdkOpen] = useState(false);
	const { totalCount: cartCount } = useCart();
	const { count: wishCount } = useWishlist();
	const debouncedQuery = useDebounce(query, 300);
	const router = useRouter();

	useEffect(() => {
		const trimmed = debouncedQuery.trim();
		if (trimmed.length > 0) {
			router.push(`/search?q=${encodeURIComponent(trimmed)}`);
		}
	}, [debouncedQuery, router]);

	// ⌘K / Ctrl+K з будь-якого місця сторінки — той самий приклад, що в
	// документації cmdk. preventDefault обов'язковий: без нього браузер сам
	// перехоплює ⌘K/Ctrl+K (пошук у адресному рядку в частині браузерів).
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setCmdkOpen((open) => !open);
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<header className="relative z-10 border-b border-border bg-bg font-sans">
			<div className="flex items-center justify-center gap-2 border-b border-border bg-bg-subtle px-6 py-[7px]">
				<span className="font-mono text-[11px] tracking-[0.02em] text-fg-muted">
					Безкоштовна доставка від 1 500 ₴ по всій Україні
				</span>
			</div>

			<div className="mx-auto flex h-16 max-w-[1280px] items-center gap-7 px-5 md:px-10">
				<Link href="/" className="flex flex-none items-center gap-[9px] no-underline">
					<span className="grid h-7 w-7 flex-none place-items-center rounded-[8px] bg-accent font-mono text-[9px] font-bold tracking-[0.01em] text-white">
						NBY
					</span>
					<span className="text-[15.5px] font-semibold tracking-[-0.02em] text-fg">NBY Shop</span>
				</Link>

				<nav className="hidden items-center gap-[22px] md:flex">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className="text-[13.5px] font-medium text-fg-muted no-underline hover:text-fg"
						>
							{link.label}
						</Link>
					))}
					<Link
						href="#"
						className="flex items-center gap-[6px] text-[13.5px] font-medium text-fg-muted no-underline hover:text-fg"
					>
						Розпродаж
						<span className="rounded-[4px] bg-accent-subtle px-[5px] py-[2px] font-mono text-[9.5px] font-semibold text-accent">
							-40%
						</span>
					</Link>
				</nav>

				<form
					role="search"
					onSubmit={(e) => {
						e.preventDefault();
						const trimmed = query.trim();
						if (trimmed.length > 0) {
							router.push(`/search?q=${encodeURIComponent(trimmed)}`);
						}
					}}
					className="hidden h-9 max-w-[340px] flex-1 items-center gap-2 rounded-control border border-border bg-bg-subtle px-[11px] md:flex"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="flex-none text-fg-subtle"
					>
						<circle cx="11" cy="11" r="7" />
						<path d="M21 21l-4.5-4.5" />
					</svg>
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Пошук товарів..."
						aria-label="Пошук товарів"
						className="flex-1 bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
					/>
					<button
						type="button"
						onClick={() => setCmdkOpen(true)}
						aria-label="Швидкі команди"
						className="flex-none rounded-[4px] border border-border bg-bg px-[5px] py-[2px] font-mono text-[10px] font-medium text-fg-subtle hover:border-border-strong hover:text-fg"
					>
						⌘K
					</button>
				</form>

				<div className="ml-auto flex flex-none items-center gap-[6px]">
					<ThemeToggle />

					<button
						type="button"
						aria-label="Пошук"
						className="grid h-[34px] w-[34px] place-items-center rounded-control border border-transparent text-fg-muted hover:bg-bg-muted hover:text-fg md:hidden"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<circle cx="11" cy="11" r="7" />
							<path d="M21 21l-4.5-4.5" />
						</svg>
					</button>

					<Link
						href="/account"
						aria-label="Акаунт"
						className="hidden h-[34px] w-[34px] place-items-center rounded-control border border-transparent text-fg-muted no-underline hover:bg-bg-muted hover:text-fg md:grid"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
						>
							<circle cx="12" cy="8" r="4" />
							<path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
						</svg>
					</Link>

					<Link
						href="/wishlist"
						aria-label="Обране"
						className="relative hidden h-[34px] w-[34px] place-items-center rounded-control border border-transparent text-fg-muted no-underline hover:bg-bg-muted hover:text-fg md:grid"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
						>
							<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
						</svg>
						<span
							className="absolute right-0 top-[1px] flex h-[15px] min-w-[15px] items-center justify-center rounded-[8px] bg-fg px-[3px] font-mono text-[9.5px] font-semibold text-bg"
							suppressHydrationWarning
						>
							{wishCount}
						</span>
					</Link>

					<Link
						href="/checkout"
						aria-label="Кошик"
						className="relative flex h-[34px] items-center gap-2 rounded-control border border-border bg-bg px-3 text-fg no-underline hover:bg-bg-muted"
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
						>
							<path d="M6 7h12l-1.2 12.5H7.2z" />
							<path d="M9 7a3 3 0 0 1 6 0" />
						</svg>
						<span className="font-mono text-[12.5px] font-semibold" suppressHydrationWarning>
							{cartCount}
						</span>
					</Link>

					<button
						type="button"
						aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
						onClick={() => setMenuOpen((v) => !v)}
						className="grid h-[34px] w-[34px] place-items-center rounded-control border border-transparent text-fg-muted hover:bg-bg-muted hover:text-fg md:hidden"
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							{menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
						</svg>
					</button>
				</div>
			</div>

			{menuOpen && (
				<div className="flex flex-col gap-1 border-t border-border bg-bg px-5 py-3 md:hidden">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							onClick={() => setMenuOpen(false)}
							className="rounded-control px-2 py-2 text-[14px] font-medium text-fg no-underline hover:bg-bg-muted"
						>
							{link.label}
						</Link>
					))}
					<Link
						href="#"
						onClick={() => setMenuOpen(false)}
						className="flex items-center gap-2 rounded-control px-2 py-2 text-[14px] font-medium text-fg no-underline hover:bg-bg-muted"
					>
						Розпродаж
						<span className="rounded-[4px] bg-accent-subtle px-[5px] py-[2px] font-mono text-[9.5px] font-semibold text-accent">
							-40%
						</span>
					</Link>
				</div>
			)}

			<CommandMenu open={cmdkOpen} onOpenChange={setCmdkOpen} />
		</header>
	);
}
