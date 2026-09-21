import { CheckoutForm } from "@/components/CheckoutForm";

// Тонка серверна обгортка — той самий патерн, що app/wishlist/page.tsx
// (епізод 9): кошик живе лише в localStorage, тож усе, що читає useCart(),
// має бути клієнтським. Сторінка сама лишається Server Component заради
// майбутнього metadata/SEO — весь реальний рендер у CheckoutForm.
export default function CheckoutPage() {
	return <CheckoutForm />;
}
