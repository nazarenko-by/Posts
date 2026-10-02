import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Епізод 17 — robots: noindex на весь /admin/* піддерево (metadata у
// layout.tsx успадковується всіма вкладеними сторінками, включно з
// майбутніми /admin/orders тощо) — гейтована адмінка не повинна навіть
// теоретично з'являтись у пошуковій видачі.
export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

// Епізод 15 — s_admin з кіту (COMPONENTS.md → "12. Admin screen"): власна
// оболонка з 216px sidebar, НЕ обгорнута в ShopHeader/Footer (окремий layout,
// не app/(shop)/layout.tsx). Гейт: не-адмін (або гість) редіректиться на /auth,
// той самий callbackUrl-патерн, що /account (епізод 14). Ще одна перевірка —
// у самих Server Actions (lib/require-admin.ts) — layout можна оминути прямим
// запитом на action, тож UX-гейт тут не єдиний захист.
//
// Скоуп епізоду — "проста CRUD-форма для товарів": з 6 пунктів меню кіту
// реально працює лише "Товари". Решта (Дашборд/Замовлення/Клієнти/Промо/
// Налаштування) — задизейблені з поясненням, той самий принцип чесності про
// межі скоупу, що OAuth-кнопки в AuthForm.tsx і бонус-картка в /account.
const NAV_ITEMS = [
	{ label: "Дашборд", href: null, badge: null },
	{ label: "Товари", href: "/admin/products", badge: null },
	{ label: "Замовлення", href: null, badge: "4" },
	{ label: "Клієнти", href: null, badge: null },
	{ label: "Промо", href: null, badge: null },
	{ label: "Налаштування", href: null, badge: null },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
	const user = await getCurrentUser();
	if (!user) redirect("/auth?callbackUrl=/admin/products");
	if (!user.isAdmin) redirect("/");

	return (
		<div className="grid min-h-screen grid-cols-1 md:grid-cols-[216px_1fr]">
			<aside className="flex flex-col justify-between border-r border-border bg-bg-subtle px-4 py-6">
				<div className="flex flex-col gap-6">
					<Link href="/" className="px-2 text-[15px] font-semibold tracking-[-0.02em] text-fg no-underline">
						NBY <span className="text-fg-subtle">/ admin</span>
					</Link>

					<nav className="flex flex-col gap-1">
						{NAV_ITEMS.map((item) =>
							item.href ? (
								<Link
									key={item.label}
									href={item.href}
									className="flex items-center justify-between rounded-control px-3 py-2 text-[13px] font-medium text-fg no-underline hover:bg-bg-muted"
								>
									{item.label}
								</Link>
							) : (
								<span
									key={item.label}
									className="flex cursor-not-allowed items-center justify-between rounded-control px-3 py-2 text-[13px] text-fg-subtle"
									title="Поза скоупом епізоду 15 — лише «Товари» підключені до реальних даних"
								>
									{item.label}
									{item.badge && (
										<span className="rounded-full bg-bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-fg-subtle">
											{item.badge}
										</span>
									)}
								</span>
							)
						)}
					</nav>
				</div>

				<div className="rounded-card border border-border bg-bg px-3 py-2.5 font-mono text-[10.5px] text-fg-subtle">
					production · prisma 6.x · pg 16
				</div>
			</aside>

			<main className="px-6 py-8 md:px-10">{children}</main>
		</div>
	);
}
