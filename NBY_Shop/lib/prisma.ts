import { PrismaClient } from "@prisma/client";

// Стандартний Next.js-патерн: у dev hot-reload створює новий PrismaClient
// на кожен реіmport модуля, поки не заб'є ліміт з'єднань до бази.
// Тримаємо один інстанс у global, щоб hot-reload його перевикористовував.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
