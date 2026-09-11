"use client";

import { useEffect, useState } from "react";

// Той самий useDebounce, що вже показали на слайдах постів 169-170 (і в
// клікабельному демо post_170/index.tsx) — тепер підключаємо його до
// реального пошуку в шапці магазину, а не лише до навчального прикладу.
// setTimeout ставить оновлення на delay мс вперед, а cleanup-функція
// useEffect скасовує попередній таймер щохвилини value змінюється —
// саме це "з'їдає" проміжні onChange-виклики під час швидкого набору.
export function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);

	return debounced;
}
