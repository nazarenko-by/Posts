import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { queries } from "./queries-prisma";
export const open = (file: string) => queries(new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${file}` }) }));
