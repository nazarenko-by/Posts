// ArkType 2 - та сама схема: рядкові визначення, trim - морфізм "string.trim", перевірка картки - narrow().
// Відмінність: narrow() запускається лише коли решта полів валідні, тож на невалідній формі помилки картки
// з'являться другим кроком (Zod і Valibot показують усі 5 одразу).
import { type } from "arktype";
import { digitsOnly, isExpiryValid, isLuhnValid } from "./card";

const str = (def: string, message: string) => type("string.trim").to(type(def as any).configure({ message }));

export const schema = type({
    firstName: str("string >= 2", "Мінімум 2 символи"),
    lastName: str("string >= 2", "Мінімум 2 символи"),
    email: str("string.email", "Некоректний email"),
    phone: str("/^\\+380\\d{9}$/", "Формат: +380XXXXXXXXX"),
    city: str("string >= 2", "Вкажи місто"),
    address: str("string >= 5", "Вкажи адресу або відділення"),
    shipping: type("'nova_poshta' | 'courier' | 'pickup'").configure({ message: "Обери спосіб доставки" }),
    payment: type("'card' | 'apple_pay' | 'cod'").configure({ message: "Обери спосіб оплати" }),
    // undefined дозволено явно: в ArkType необов'язковий ключ за замовчуванням не приймає значення undefined
    "cardNumber?": "string.trim | undefined",
    "cardExpiry?": "string.trim | undefined",
    "cardCvc?": "string.trim | undefined",
}).narrow((d, ctx) => {
    if (d.payment !== "card") return true;
    let ok = true;
    if (!isLuhnValid(digitsOnly(d.cardNumber ?? ""))) ok = ctx.reject({ path: ["cardNumber"], message: "Недійсний номер картки" });
    if (!isExpiryValid(d.cardExpiry ?? "")) ok = ctx.reject({ path: ["cardExpiry"], message: "Формат MM/YY, не в минулому" });
    if (!/^\d{3,4}$/.test(d.cardCvc ?? "")) ok = ctx.reject({ path: ["cardCvc"], message: "3-4 цифри" });
    return ok;
});

export function validate(input: unknown) {
    const r = schema(input);
    if (!(r instanceof type.errors)) return { ok: true as const, data: r };
    return { ok: false as const, errors: Object.fromEntries(r.map((e) => [String(e.path[0]), e.message])) };
}
