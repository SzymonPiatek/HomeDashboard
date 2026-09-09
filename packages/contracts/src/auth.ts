import { z } from "zod";

/**
 * GET /api/auth/session zawsze zwraca 200 — kontrakt mówi tylko, czy sesja
 * istnieje, nigdy jej nie wymusza (ADR-0003, .claude/rules/api.md).
 */
export const authSessionSchema = z.discriminatedUnion("authenticated", [
  z.object({ authenticated: z.literal(true), email: z.string().email() }),
  z.object({ authenticated: z.literal(false) }),
]);

export type AuthSession = z.infer<typeof authSessionSchema>;
