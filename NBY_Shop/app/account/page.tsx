import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatOrderNumber } from "@/lib/order-number";
import { formatUAH } from "@/lib/format";
import { signOutAction } from "@/app/auth/actions";

// Епізод 14 — s_account з кіту (COMPONENTS.md → "11. Account screen"):
// 232px 1fr грід, sidebar з аватаром-ініціалами й nav-списком, бонус-картка
// внизу. Реалізовано по-справжньому лише "Замовлення" й "Вийти" — Обране вже
// має свою сторінку з епізоду 9, тож просто лінк; Адреси/Особисті дані й
// бонусний баланс — декоративні (нема відповідних моделей у БД), той самий
// принцип чесності про межі скоупу, що "Зберегти картку" в CheckoutForm.tsx.
//
// Guard — сторінка серверна, редірект на /auth?callbackUrl=/account, якщо
// getCurrentUser() (lib/auth.ts, власний JWT з httpOnly-куки) повертає null.

const STATUS_LABEL: Record<string, string> = {
	PACKING: "пакуємо",
	DELIVERED: "доставлено",
	CANCELLED: "скасовано",
};

function StatusBadge({ status }: { status: string }) {
	const classes =
		status === "DELIVERED"
			? "bg-ok-subtle text-ok"
			: status === "CANCELLED"
				? "bg-danger-subtle text-danger"
				: "bg-accent-subtle text-accent";

	return (
		<span className={`rounded-[6px] px-2 py-1 font-mono text-[10.5px] font-semibold uppercase ${classes}`}>
			{STATUS_LABEL[status] ?? status}
		</span>
	);
}

export default async function AccountPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/auth?callbackUrl=/account");

	const orders = await prisma.order.findMany({
		where: { userId: user.id },
		include: { items: true },
		orderBy: { createdAt: "desc" },
	});

	const initials =
		user.name
			.split(" ")
			.map((part: string) => part[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?";

	return (
		<div className="mx-auto max-w-6xl px-6 py-10">
			<div className="grid grid-cols-1 gap-8 md:grid-cols-[232px_1fr]">
				<aside className="flex flex-col gap-6">
					<div className="flex items-center gap-3">
						<span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-accent font-mono text-[14px] font-semibold text-white">
							{initials}
						</span>
						<div className="flex min-w-0 flex-col">
							<span className="truncate text-[13.5px] font-semibold text-fg">{user.name}</span>
							<span className="truncate text-[11.5px] text-fg-muted">{user.email}</span>
						</div>
					</div>

					<nav className="flex flex-col gap-1">
						<span className="rounded-control bg-bg-subtle px-3 py-2 text-[13px] font-medium text-fg">
							Замовлення
						</span>
						<Link
							href="/wishlist"
							className="rounded-control px-3 py-2 text-[13px] text-fg-muted no-underline hover:bg-bg-muted hover:text-fg"
						>
							Обране
						</Link>
						<span className="cursor-not-allowed rounded-control px-3 py-2 text-[13px] text-fg-subtle">
							Адреси
						</span>
						<span className="cursor-not-allowed rounded-control px-3 py-2 text-[13px] text-fg-subtle">
							Особисті дані
						</span>
						<form action={signOutAction}>
							<button
								type="submit"
								className="w-full rounded-control px-3 py-2 text-left text-[13px] text-fg-muted hover:bg-bg-muted hover:text-fg"
							>
								Вийти
							</button>
						</form>
					</nav>

					<div className="rounded-card border border-border bg-bg-subtle p-4">
						<span className="text-[11px] text-fg-subtle">Бонусний баланс</span>
						<div className="mt-1 font-mono text-[18px] font-semibold text-fg">1 240 ₴</div>
						<p className="mt-1.5 text-[10.5px] leading-relaxed text-fg-subtle">
							1 ₴ = 1 бонус, списується до 20% суми замовлення — демо-число з кіту, бонусної моделі в БД
							поки нема.
						</p>
					</div>
				</aside>

				<div className="flex flex-col gap-4">
					<h1 className="text-[20px] font-semibold text-fg">Історія замовлень</h1>

					{orders.length === 0 ? (
						<div className="rounded-card border border-border bg-bg-subtle p-10 text-center">
							<p className="text-[13.5px] text-fg-muted">Замовлень поки нема.</p>
							<Link
								href="/"
								className="mt-4 inline-flex h-9 items-center rounded-control bg-fg px-4 font-mono text-[12.5px] font-medium text-bg no-underline"
							>
								До каталогу
							</Link>
						</div>
					) : (
						orders.map((order) => (
							<div
								key={order.id}
								className={`rounded-card border border-border ${order.status === "CANCELLED" ? "opacity-[.72]" : ""}`}
							>
								<div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
									<span className="font-mono text-[12.5px] font-semibold text-fg">
										#{formatOrderNumber(order.orderSeq, order.createdAt)}
									</span>
									<span className="text-[11.5px] text-fg-muted">
										{order.createdAt.toLocaleDateString("uk-UA")}
									</span>
									<StatusBadge status={order.status} />
									<span
										className={`ml-auto font-mono text-[13px] font-semibold text-fg ${
											order.status === "CANCELLED" ? "line-through" : ""
										}`}
									>
										{formatUAH(order.totalUAH)}
									</span>
								</div>
								<div className="flex items-center gap-3 px-5 py-3.5">
									<div className="flex flex-none -space-x-2">
										{order.items.slice(0, 3).map((item: { id: string }) => (
											<div
												key={item.id}
												className="h-9 w-9 flex-none rounded-[8px] border-2 border-bg bg-bg-muted"
											/>
										))}
									</div>
									<span className="min-w-0 flex-1 truncate text-[12.5px] text-fg-muted">
										{order.items.map((i: { title: string }) => i.title).join(", ")}
									</span>
									<span className="flex-none text-[11.5px] text-fg-subtle">{order.city}</span>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
