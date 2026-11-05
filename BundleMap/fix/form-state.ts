// Початкові стани форм - без імпорту zod: клієнтські компоненти тягнуть лише ці константи
import type { AuthState } from "@/lib/auth-schema";
import type { CheckoutState } from "@/lib/checkout-schema";

export const initialAuthState: AuthState = { status: "idle", errors: {} };
export const initialCheckoutState: CheckoutState = { status: "idle", errors: {} };
