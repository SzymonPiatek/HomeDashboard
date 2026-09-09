import { defineConfig, env } from "prisma/config";

// Katalog, nie plik — jeden plik na obszar domeny (.claude/rules/data.md).
// Prisma 7 czyta URL bazy stąd, nie z schema.prisma; DATABASE_URL pochodzi
// z envs/shared.env + envs/api.env (.claude/rules/dev.md), wczytanych przez
// wywołującego (patrz skrypty "db:*" w package.json).
export default defineConfig({
  schema: "prisma/schema",
  // Migracje osobno od plików domeny — schema/ zawiera wyłącznie *.prisma.
  migrations: {
    path: "prisma/migrations",
    // tsx, nie ts-node — już jest devDependency (.claude/rules/dev.md).
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
