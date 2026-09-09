import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma 7 wymaga jawnego adaptera sterownika (bez niego PrismaClient rzuca przy
 * konstrukcji — nie jest to wybór biblioteki, tylko wymóg już wybranej wersji Prismy).
 * DATABASE_URL jest tu czytany bezpośrednio z process.env, bo do czasu importu tego
 * modułu env już przeszedł walidację zodem w config/env.ts.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

/**
 * Jedyna instancja klienta Prismy, importowana wyłącznie przez repozytoria
 * (.claude/rules/api.md — "repository — jedyne miejsce, w którym występuje prisma").
 */
export const prisma = new PrismaClient({ adapter });
