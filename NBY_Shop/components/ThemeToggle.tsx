"use client";

import { useTheme } from "next-themes";

// Перемикач light/dark у ShopHeader. `resolvedTheme` навмисно `undefined`
// на сервері й у першому клієнтському рендері (next-themes синхронізує його
// вже після гідратації) — рендеримо нейтральну іконку-заглушку, поки не
// прийде реальне значення, замість власного useState+useEffect "mounted"-хаку
// (той викликає зайвий ре-рендер і ловить set-state-in-effect від eslint).
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="grid h-[34px] w-[34px] place-items-center rounded-control border border-transparent text-fg-muted hover:bg-bg-muted hover:text-fg"
		>
			{!resolvedTheme ? (
				<span className="h-4 w-4" />
			) : isDark ? (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
					<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
				</svg>
			) : (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
					<circle cx="12" cy="12" r="4.5" />
					<path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
				</svg>
			)}
		</button>
	);
}
