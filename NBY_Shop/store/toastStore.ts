// Епізод 12+ (Інструменти, Reels) — Zustand. Той самий toast, що
// context/ToastContext.tsx з епізоду 8 (COMPONENTS.md → "14. Toast screen":
// bottom-right 24px, стек максимум 3, 352px, 4s/8s, toastIn .25s ease-out),
// написаний як Zustand-стор замість Context+Provider.
//
// Головна різниця не в кількості рядків (їх майже стільки ж) — а в тому, що
// зникає ланцюжок Context → Provider → useContext-хук з ручною перевіркою
// null (`useToast має викликатись усередині <ToastProvider>`). Тут стор — це
// просто хук: `create()` повертає готовий `useToastStore`, і будь-який
// компонент читає з нього напряму, без обгортки в app/layout.tsx.
import { create } from "zustand";

export type ToastAction = { label: string; onClick: () => void };

export type ToastItem = {
	id: number;
	title: string;
	subtitle?: string;
	variant: "success" | "error";
	action?: ToastAction;
};

type ToastOptions = Omit<ToastItem, "id">;

type ToastStore = {
	toasts: ToastItem[];
	showToast: (opts: ToastOptions) => void;
	dismissToast: (id: number) => void;
};

const MAX_STACK = 3;
const DURATION_MS: Record<ToastItem["variant"], number> = {
	success: 4000,
	error: 8000,
};

let nextId = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
	toasts: [],

	dismissToast: (id) => {
		set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
	},

	showToast: (opts) => {
		const id = nextId++;
		set((state) => {
			const next = [...state.toasts, { id, ...opts }];
			// max 3 на екрані одночасно — найстаріший іде під ніж, коли стек переповнений.
			return { toasts: next.length > MAX_STACK ? next.slice(next.length - MAX_STACK) : next };
		});
		setTimeout(() => get().dismissToast(id), DURATION_MS[opts.variant]);
	},
}));
