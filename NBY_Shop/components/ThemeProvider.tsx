"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// app/layout.tsx лишається Server Component, а next-themes сам — client-only
// (читає/пише localStorage, вставляє inline-скрипт до гідратації) — тому
// тонка client-обгортка тут, а не прямий імпорт у layout.tsx.
//
// attribute="data-theme" — навмисно, а не стандартний shadcn клас ".dark":
// наш globals.css з епізоду 1 вже написаний під [data-theme="dark"]
// (1:1 з дизайн-кітом), тож next-themes просто вмикається в готову розмітку.
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider attribute="data-theme" defaultTheme="system" enableSystem {...props}>
			{children}
		</NextThemesProvider>
	);
}
