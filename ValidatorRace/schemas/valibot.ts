// Valibot 1 - та сама схема: pipe() з окремими діями, перевірка картки - forward(partialCheck()).
import * as v from "valibot";
import { digitsOnly, isExpiryValid, isLuhnValid } from "./card";

const str = (...actions: any[]) => v.pipe(v.string(), v.trim(), ...actions);

export const schema = v.pipe(
    v.object({
        firstName: str(v.minLength(2, "Мінімум 2 символи")),
        lastName: str(v.minLength(2, "Мінімум 2 символи")),
        email: str(v.email("Некоректний email")),
        phone: str(v.regex(/^\+380\d{9}$/, "Формат: +380XXXXXXXXX")),
        city: str(v.minLength(2, "Вкажи місто")),
        address: str(v.minLength(5, "Вкажи адресу або відділення")),
        shipping: v.picklist(["nova_poshta", "courier", "pickup"], "Обери спосіб доставки"),
        payment: v.picklist(["card", "apple_pay", "cod"], "Обери спосіб оплати"),
        cardNumber: v.optional(str()),
        cardExpiry: v.optional(str()),
        cardCvc: v.optional(str()),
    }),
    v.forward(
        v.partialCheck([["payment"], ["cardNumber"]],
            (d) => d.payment !== "card" || isLuhnValid(digitsOnly(d.cardNumber ?? "")), "Недійсний номер картки"),
        ["cardNumber"],
    ),
    v.forward(
        v.partialCheck([["payment"], ["cardExpiry"]],
            (d) => d.payment !== "card" || isExpiryValid(d.cardExpiry ?? ""), "Формат MM/YY, не в минулому"),
        ["cardExpiry"],
    ),
    v.forward(
        v.partialCheck([["payment"], ["cardCvc"]],
            (d) => d.payment !== "card" || /^\d{3,4}$/.test(d.cardCvc ?? ""), "3-4 цифри"),
        ["cardCvc"],
    ),
);

export function validate(input: unknown) {
    const r = v.safeParse(schema, input);
    if (r.success) return { ok: true as const, data: r.output };
    return { ok: false as const, errors: Object.fromEntries(r.issues.map((i) => [String(i.path?.[0]?.key), i.message])) };
}
