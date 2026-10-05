import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShopHeader } from "@/components/ShopHeader";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/context/CartContext";
import { ToastViewport } from "@/components/ToastViewport";
import { WishlistProvider } from "@/context/WishlistContext";
import { SITE_URL } from "@/lib/site";

// Geist для інтерфейсу, Geist Mono для цін/SKU/лейблів — див. DESIGN_SYSTEM.md.
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin", "cyrillic"],
});

// Епізод 17 — metadataBase потрібен, щоб відносні openGraph.images (напр.
// /product/[slug]/opengraph-image, нижче) розрізались у абсолютні URL —
// без нього Next.js попереджає в консолі й OG-картинки можуть не
// підхопитись соцмережами. Адреса береться з lib/site.ts
// (env-змінна або системна VERCEL_PROJECT_PRODUCTION_URL).
//
// title.template — дочірні сторінки (generateMetadata у
// app/product/[slug]/page.tsx) задають лише title: product.title, Next.js
// сам підставляє " · NBY Shop" — один раз описано тут, а не в кожному файлі.
export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "NBY Shop",
		template: "%s · NBY Shop",
	},
	description: "Мерч для тих, хто читає стектрейси на дозвіллі.",
	openGraph: {
		siteName: "NBY Shop",
		locale: "uk_UA",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Header/Footer — епізод 2 (UI-фундамент): responsive навбар + футер,
	// винесені сюди, а не в page.tsx, щоб бути на кожній майбутній сторінці.
	//
	// Дарк мод — епізод 3 (next-themes): suppressHydrationWarning обов'язковий,
	// бо next-themes сам проставляє data-theme на <html> ще до гідратації —
	// без цього React лаявся б на "мисматч" атрибута, якого сам і очікує.
	// defaultTheme="system" — стартуємо з ОС-теми, ThemeToggle (у ShopHeader)
	// дозволяє перемкнути вручну, next-themes сам запам'ятовує вибір.
	//
	// Кошик — епізод 7: CartProvider над усім деревом, бо лічильник у шапці
	// й кнопка "Додати в кошик" на сторінці товару мають бачити той самий стан.
	//
	// Toast — епізод 8: спершу ToastProvider тут-таки, над CartProvider.
	// Епізод 12+ (Інструменти) — toast-стан переїхав у Zustand
	// (store/toastStore.ts): жодного Provider більше не треба, ToastViewport
	// читає стор напряму, тож дерево тут стало на один рівень мілкішим.
	//
	// Обране — епізод 9: WishlistProvider поряд з CartProvider — той самий
	// рівень дерева, той самий lazy-init-з-localStorage принцип, окремий стан.
	return (
		<html lang="uk" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-bg-muted antialiased`}
			>
				<ThemeProvider>
					<CartProvider>
						<WishlistProvider>
							<ShopHeader />
							<main className="flex-1">{children}</main>
							<Footer />
							<ToastViewport />
						</WishlistProvider>
					</CartProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
