import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Ручний shadcn-style Button (cva-варіанти + cn()), а не повний `shadcn` CLI —
// той генерує власний HSL-набір токенів у globals.css, що конфліктує з нашим
// hex-based `@theme` блоком з епізоду 1 (див. ShopProject/DESIGN_SYSTEM.md).
// API (variant/size пропси) — той самий, що й у справжнього shadcn Button,
// тож перехід на CLI-версію пізніше буде безболісним, якщо знадобиться.
// Стилі — 1:1 з кнопок у COMPONENTS.md (height 38/46px, radius 9-10px).

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium font-sans transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
	{
		variants: {
			variant: {
				primary: "bg-accent text-accent-fg hover:bg-accent-hover",
				secondary: "border border-border bg-bg text-fg hover:bg-bg-muted",
				ghost: "bg-transparent text-fg-muted hover:bg-bg-muted hover:text-fg",
				destructive: "bg-danger text-white hover:opacity-90",
				link: "bg-transparent text-fg underline underline-offset-4 p-0 h-auto",
			},
			size: {
				default: "h-[38px] px-4 text-[13.5px]",
				lg: "h-[46px] px-5 text-sm",
				icon: "h-[34px] w-[34px] p-0",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
	return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

// Експортуємо варіанти окремо для випадків, коли CTA має бути <Link>, а не
// <button> (напр. Hero) — так само, як shadcn радить style-ити `asChild`-кейси
// без Radix Slot, якого ми свідомо не підключали.
export { buttonVariants };
