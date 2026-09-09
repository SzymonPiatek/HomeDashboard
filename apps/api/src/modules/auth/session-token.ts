import { createHash, randomBytes } from "node:crypto";

/** Identyfikator sesji: 32 losowe bajty — sekret podpisu nie istnieje (ADR-0003). */
export function generateSessionId(): string {
  return randomBytes(32).toString("base64url");
}

/** W bazie leży wyłącznie skrót, nigdy wartość surowa (.claude/rules/api.md). */
export function hashSessionId(rawSessionId: string): string {
  return createHash("sha256").update(rawSessionId).digest("hex");
}
