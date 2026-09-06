import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShopHeader } from "@/components/ShopHeader";
import { Footer } from "@/components/Footer";

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
	// Перемикач теми (next-themes, [data-theme]) з'являється у епізоді 3 —
	// поки що фіксований light mode.
	// Header/Footer — епізод 2 (UI-фундамент): responsive навбар + футер,
	// винесені сюди, а не в page.tsx, щоб бути на кожній майбутній сторінці.
	return (
		<html lang="uk" data-theme="light">
			<body
				className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-bg-muted antialiased`}
			>
				<ShopHeader />
				<main className="flex-1">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
