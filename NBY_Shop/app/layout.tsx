import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  return (
    <html lang="uk" data-theme="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
