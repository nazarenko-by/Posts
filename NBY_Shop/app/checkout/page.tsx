import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

// Тонка серверна обгортка — той самий патерн, що app/wishlist/page.tsx
// (епізод 9): кошик живе лише в localStorage, тож усе, що читає useCart(),
// має бути клієнтським. Сторінка сама лишається Server Component заради
// майбутнього metadata/SEO — весь реальний рендер у CheckoutForm.
//
// Епізод 17 — robots: noindex. Чекаут персональний (кошик з localStorage,
// чужий відвідувач побачить порожній стан) і не повинен індексуватись чи
// з'являтись у видачі — той самий принцип, що /account і /admin нижче.
export const metadata: Metadata = {
	title: "Оформлення замовлення",
	robots: { index: false, follow: false },
};

export default function CheckoutPage() {
	return <CheckoutForm />;
}
