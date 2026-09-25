import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

// Епізод 14 — тонка серверна обгортка (той самий патерн, що app/checkout/
// page.tsx з епізоду 11): вся клієнтська логіка в AuthForm.tsx, тут лише
// guard — уже залогінений юзер не має бачити форму входу, одразу на /account.
// callbackUrl (Next 16 — searchParams як Promise) прокидається у форму й
// назад у Server Action, щоб після входу повернути туди, звідки прийшли
// (напр. /checkout, якщо туди редіректнули "увійти, щоб оформити").
export default async function AuthPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
	const user = await getCurrentUser();
	if (user) redirect("/account");

	const { callbackUrl } = await searchParams;

	return (
		<div className="mx-auto max-w-6xl px-6 py-16">
			<AuthForm callbackUrl={callbackUrl} />
		</div>
	);
}
