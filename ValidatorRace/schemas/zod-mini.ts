// Zod 4 Mini (zod/mini) - та сама схема у функціональному API, що краще tree-shake'иться.
import * as z from "zod/mini";
import { digitsOnly, isExpiryValid, isLuhnValid } from "./card";

const str = (...checks: any[]) => z.string().check(z.trim(), ...checks);

export const schema = z
    .object({
        firstName: str(z.minLength(2, "Мінімум 2 символи")),
        lastName: str(z.minLength(2, "Мінімум 2 символи")),
        email: str(z.email("Некоректний email")),
        phone: str(z.regex(/^\+380\d{9}$/, "Формат: +380XXXXXXXXX")),
        city: str(z.minLength(2, "Вкажи місто")),
        address: str(z.minLength(5, "Вкажи адресу або відділення")),
        shipping: z.enum(["nova_poshta", "courier", "pickup"], { message: "Обери спосіб доставки" }),
        payment: z.enum(["card", "apple_pay", "cod"], { message: "Обери спосіб оплати" }),
        cardNumber: z.optional(str()),
        cardExpiry: z.optional(str()),
        cardCvc: z.optional(str()),
    })
    .check(
        z.superRefine((data, ctx) => {
            if (data.payment !== "card") return;
            if (!isLuhnValid(digitsOnly(data.cardNumber ?? "")))
                ctx.issues.push({ code: "custom", input: data, path: ["cardNumber"], message: "Недійсний номер картки" });
            if (!isExpiryValid(data.cardExpiry ?? ""))
                ctx.issues.push({ code: "custom", input: data, path: ["cardExpiry"], message: "Формат MM/YY, не в минулому" });
            if (!/^\d{3,4}$/.test(data.cardCvc ?? ""))
                ctx.issues.push({ code: "custom", input: data, path: ["cardCvc"], message: "3-4 цифри" });
        }),
    );

export function validate(input: unknown) {
    const r = z.safeParse(schema, input);
    if (r.success) return { ok: true as const, data: r.data };
    return { ok: false as const, errors: Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])) };
}
