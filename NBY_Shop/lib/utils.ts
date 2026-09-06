import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Стандартний shadcn-конвенційний helper — мерджить Tailwind-класи без конфліктів
// (напр. "px-2 px-4" → "px-4"). Використовується в components/ui/*.
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
