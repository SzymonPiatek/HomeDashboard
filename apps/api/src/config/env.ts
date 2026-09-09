import { z } from "zod";

/** "true"/"false" jawnie — z.coerce.boolean() uznałby "false" za prawdę. */
const booleanFlagSchema = z.enum(["true", "false"]).transform((value) => value === "true");

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  // ADR-0001 — logowanie Google, poufny klient serwerowy.
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.url(),

  // Jedyny adres, dla którego logowanie się powiedzie — .claude/rules/api.md.
  OWNER_EMAIL: z.string().email(),

  // Czasy życia sesji w dniach, dwie wartości — ADR-0003.
  SESSION_TTL_KIOSK_DAYS: z.coerce.number().int().positive().default(180),
  SESSION_TTL_STANDARD_DAYS: z.coerce.number().int().positive().default(7),

  // Wymagana jawnie (bez default) — brak w prod nie może po cichu wyłączyć Secure.
  // false w dev (http://localhost), true na produkcji — ADR-0003.
  COOKIE_SECURE: booleanFlagSchema,
});

export type Env = z.infer<typeof envSchema>;

/** Proces bez wymaganej zmiennej ma się nie uruchomić — .claude/rules/api.md. */
export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;

  const invalid = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Invalid environment configuration: ${invalid}`);
}
