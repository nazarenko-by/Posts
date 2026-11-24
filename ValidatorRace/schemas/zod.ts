// Zod 4 (класичний API) - схема оформлення замовлення NBY Shop 1:1 з lib/checkout-schema.ts.
import { z } from "zod";
import { digitsOnly, isExpiryValid, isLuhnValid } from "./card";

export const schema = z
    .object({
        firstName: z.string().trim().min(2, "Мінімум 2 символи"),
        lastName: z.string().trim().min(2, "Мінімум 2 символи"),
        email: z.string().trim().email("Некоректний email"),
        phone: z.string().trim().regex(/^\+380\d{9}$/, "Формат: +380XXXXXXXXX"),
        city: z.string().trim().min(2, "Вкажи місто"),
        address: z.string().trim().min(5, "Вкажи адресу або відділення"),
        shipping: z.enum(["nova_poshta", "courier", "pickup"], { message: "Обери спосіб доставки" }),
        payment: z.enum(["card", "apple_pay", "cod"], { message: "Обери спосіб оплати" }),
        cardNumber: z.string().trim().optional(),
        cardExpiry: z.string().trim().optional(),
        cardCvc: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.payment !== "card") return;
        if (!isLuhnValid(digitsOnly(data.cardNumber ?? "")))
            ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Недійсний номер картки" });
        if (!isExpiryValid(data.cardExpiry ?? ""))
            ctx.addIssue({ code: "custom", path: ["cardExpiry"], message: "Формат MM/YY, не в минулому" });
        if (!/^\d{3,4}$/.test(data.cardCvc ?? ""))
            ctx.addIssue({ code: "custom", path: ["cardCvc"], message: "3-4 цифри" });
    });

export function validate(input: unknown) {
    const r = schema.safeParse(input);
    if (r.success) return { ok: true as const, data: r.data };
    return { ok: false as const, errors: Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])) };
}
