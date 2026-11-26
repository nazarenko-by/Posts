import { PrismaClient } from "@prisma/client";
import { queries } from "./queries-prisma";
export const open = (file: string) => queries(new PrismaClient({ datasourceUrl: `file:${file}` }));
