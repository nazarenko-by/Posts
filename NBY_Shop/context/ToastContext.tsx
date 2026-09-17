"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

// Епізод 8 — toast-сповіщення, за специфікацією дизайн-кіту (COMPONENTS.md →
// "14. Toast screen"): bottom-right 24px, стек максимум 3, ширина 352px,
// тривалість 4s (звичайний) / 8s (error), вхід — toastIn .25s ease-out.
// Кіт називає "shadcn · sonner" як орієнтир реалізації, але ми, як і з Button
// у епізоді 2, збираємо тост вручну — той самий принцип: розуміти механізм,
// а не імпортувати чорну скриньку.
//
// Правило з кіту, яке свідомо не порушуємо: "Тост ніколи не блокує дію. Для
// критичних помилок оплати — модальне вікно, а не тост" — тому це лише success/
// error-сповіщення про некритичні події, без жодних кейсів на кшталт оплати.

export type ToastAction = { label: string; onClick: () => void };

export type ToastItem = {
	id: number;
	title: string;
	subtitle?: string;
	variant: "success" | "error";
	action?: ToastAction;
};

type ToastOptions = Omit<ToastItem, "id">;

type ToastContextValue = {
	toasts: ToastItem[];
	showToast: (opts: ToastOptions) => void;
	dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_STACK = 3;
const DURATION_MS: Record<ToastItem["variant"], number> = {
	success: 4000,
	error: 8000,
};

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const nextId = useRef(0);

	const dismissToast = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const showToast = useCallback(
		(opts: ToastOptions) => {
			const id = nextId.current++;
			setToasts((prev) => {
				const next = [...prev, { id, ...opts }];
				// max 3 на екрані одночасно — найстаріший іде під ніж, коли стек переповнений.
				return next.length > MAX_STACK ? next.slice(next.length - MAX_STACK) : next;
			});
			setTimeout(() => dismissToast(id), DURATION_MS[opts.variant]);
		},
		[dismissToast]
	);

	return <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error("useToast має викликатись усередині <ToastProvider>");
	}
	return ctx;
}
