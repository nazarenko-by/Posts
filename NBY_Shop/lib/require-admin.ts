import { getCurrentUser } from "@/lib/auth";

// Defense-in-depth: app/admin/layout.tsx уже редіректить не-адмінів, але кожна
// Server Action викликає це самостійно — той самий принцип, що verify() в
// lib/jwt.ts не довіряє клієнту. Форму можна підмінити, layout можна оминути
// прямим POST на Server Action; сервер перевіряє сам.
export async function requireAdmin() {
	const user = await getCurrentUser();
	if (!user || !user.isAdmin) {
		throw new Error("Доступ лише для адміністраторів.");
	}
	return user;
}
