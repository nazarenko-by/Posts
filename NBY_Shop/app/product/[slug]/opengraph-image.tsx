import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/products";
import { formatUAH } from "@/lib/format";

// Епізод 17 — OG-картинка, файлова конвенція Next.js: будь-який файл
// opengraph-image.tsx поруч із page.tsx автоматично підхоплюється як
// og:image/twitter:image для цього роута, Next сам генерує й <meta>-теги,
// і сам ендпойнт — жодного ручного посилання з generateMetadata() не треба.
//
// Контекст: той самий next/og, для якого ми розбирали критичний security-патч
// у пості 199 (16.3.6/15.5.26, RCE в ImageResponse через Satori) — ShopProject
// на "next": "^16.3.0", тобто вже на пропатченій версії.
//
// "Image optimization" цього епізоду — саме тут, а не в ProductCard.tsx:
// реальних фото товарів у проєкті нема (CSS-плейсхолдери з епізоду 1), тож
// обгортати заглушку в next/image заради вигляду сенсу не мало б — PNG
// 1200×630 (стандарт OG), що ImageResponse рендерить тут, це єдиний РЕАЛЬНИЙ
// растровий вихід проєкту, і саме він отримав явний розмір/формат/revalidate.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Товар у NBY Shop";
export const revalidate = 60; // та сама частота, що ISR сторінки товару (епізод 4)

export default async function Image({ params }: { params: { slug: string } }) {
	const product = await getProductBySlug(params.slug);

	const title = product?.title ?? "Товар не знайдено";
	const price = product ? formatUAH(product.priceUAH) : "";
	const category = product?.category ?? "";

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: 64,
				background: "#09090B",
				color: "#FAFAFA",
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<div
					style={{
						width: 14,
						height: 14,
						borderRadius: 4,
						background: "#5B2BFF",
					}}
				/>
				<span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>NBY Shop</span>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
				{category && (
					<span
						style={{
							fontSize: 24,
							fontWeight: 600,
							textTransform: "uppercase",
							letterSpacing: 2,
							color: "#A1A1AA",
						}}
					>
						{category}
					</span>
				)}
				<span style={{ fontSize: 60, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15 }}>{title}</span>
				{price && <span style={{ fontSize: 44, fontWeight: 700, color: "#5B2BFF" }}>{price}</span>}
			</div>
		</div>,
		{ ...size }
	);
}
