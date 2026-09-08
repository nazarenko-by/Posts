import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShopHeader } from "@/components/ShopHeader";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

// Geist для інтерфейсу, Geist Mono для цін/SKU/лейблів — див. DESIGN_SYSTEM.md.
const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
	title: "NBY Shop",
	description: "Мерч для тих, хто читає стектрейси на дозвіллі.",
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
	return (
		<html lang="uk" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-bg-muted antialiased`}
			>
				<ThemeProvider>
					<ShopHeader />
					<main className="flex-1">{children}</main>
					<Footer />
				</ThemeProvider>
			</body>
		</html>
	);
}
