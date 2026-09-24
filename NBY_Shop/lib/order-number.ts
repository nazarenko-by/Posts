// Епізод 13 — форматує номер замовлення з autoincrement-поля Order.orderSeq.
// Не зберігається в БД окремим стовпцем — див. коментар над model Order
// у schema.prisma. Формат 1:1 з кіту (COMPONENTS.md → s_success):
// "NBY-2026-04871".
export function formatOrderNumber(seq: number, createdAt: Date): string {
	return `NBY-${createdAt.getFullYear()}-${String(seq).padStart(5, "0")}`;
}
