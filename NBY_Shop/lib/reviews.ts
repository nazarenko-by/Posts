import { prisma } from "@/lib/prisma";

// Епізод 10 — "живий" рейтинг товару замість захардкодженого Product.rating.
// Product.rating лишається (каталог епізоду 6 сортує по ньому — рахувати
// aggregate на кожен товар списку було б N+1), але сторінка товару рахує
// реальне середнє прямо з Review-рядків цього товару.

export type RatingStat = { star: 5 | 4 | 3 | 2 | 1; count: number };

export async function getProductReviewStats(productId: string) {
	const [aggregate, grouped] = await Promise.all([
		prisma.review.aggregate({
			where: { productId },
			_avg: { rating: true },
			_count: true,
		}),
		prisma.review.groupBy({
			by: ["rating"],
			where: { productId },
			_count: { rating: true },
		}),
	]);

	const distribution: RatingStat[] = [5, 4, 3, 2, 1].map((star) => ({
		star: star as RatingStat["star"],
		count: grouped.find((g) => g.rating === star)?._count.rating ?? 0,
	}));

	const count = aggregate._count;
	const recommend = distribution.filter((d) => d.star >= 4).reduce((sum, d) => sum + d.count, 0);

	return {
		average: aggregate._avg.rating, // null, якщо відгуків ще нема — фолбек рахує викликач
		count,
		distribution,
		recommend,
	};
}
