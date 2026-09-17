import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Епізод 9 — перший Route Handler у проєкті. Обране живе в localStorage
// (тільки клієнт), а самі товари — у Prisma (тільки сервер): щось має
// звести ці два світи. GET /api/products?slugs=a,b,c — найпростіший міст,
// без Server Actions (ті свідомо лишені під форму чекауту в епізоді 11,
// щоб не змішувати дві нові техніки в одному епізоді).
//
// PUBLISHED-фільтр той самий, що й у каталозі/пошуку/фільтрах — DRAFT-товар
// не з'явиться в обраному, навіть якщо його slug колись потрапив у localStorage.
export async function GET(request: NextRequest) {
	const slugsParam = request.nextUrl.searchParams.get("slugs");
	if (!slugsParam) {
		return NextResponse.json({ products: [] });
	}

	const slugs = slugsParam
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);

	if (slugs.length === 0) {
		return NextResponse.json({ products: [] });
	}

	const products = await prisma.product.findMany({
		where: { slug: { in: slugs }, status: "PUBLISHED" },
	});

	return NextResponse.json({ products });
}
