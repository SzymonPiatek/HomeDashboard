import { normalizeEmail } from "./email.js";
import { hashSessionId } from "./session-token.js";
import type { AccountRecord, SessionKind, SessionRecord, SessionRepository } from "./auth.types.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export function sessionTtlDays(
  kind: SessionKind,
  ttl: { kioskDays: number; standardDays: number },
): number {
  return kind === "kiosk" ? ttl.kioskDays : ttl.standardDays;
}

export function computeExpiresAt(
  kind: SessionKind,
  now: Date,
  ttl: { kioskDays: number; standardDays: number },
): Date {
  return new Date(now.getTime() + sessionTtlDays(kind, ttl) * DAY_MS);
}

export type SessionLookupResult =
  | { status: "missing" }
  | { status: "not-found" }
  | { status: "expired"; sessionId: string }
  | { status: "not-allowlisted"; sessionId: string }
  | { status: "valid"; session: SessionRecord; account: AccountRecord };

/** Jedyne miejsce sprawdzające ważność sesji — używane przez /session i requireSession. */
export async function lookupSession(
  sessionRepository: SessionRepository,
  rawSessionId: string | undefined,
  { now, ownerEmail }: { now: Date; ownerEmail: string },
): Promise<SessionLookupResult> {
  if (!rawSessionId) return { status: "missing" };

  const found = await sessionRepository.findByTokenHashWithAccount(hashSessionId(rawSessionId));
  if (!found) return { status: "not-found" };

  if (found.expiresAt.getTime() <= now.getTime()) {
    return { status: "expired", sessionId: found.id };
  }

  if (normalizeEmail(found.account.email) !== normalizeEmail(ownerEmail)) {
    return { status: "not-allowlisted", sessionId: found.id };
  }

  return { status: "valid", session: found, account: found.account };
}

/** Przesuwa wygaśnięcie, gdy zostało mniej niż połowa czasu życia — ADR-0003. */
export function shouldExtendSession(
  session: SessionRecord,
  now: Date,
  ttl: { kioskDays: number; standardDays: number },
): boolean {
  const totalMs = sessionTtlDays(session.kind, ttl) * DAY_MS;
  const remainingMs = session.expiresAt.getTime() - now.getTime();
  return remainingMs < totalMs / 2;
}

export async function extendSession(
  sessionRepository: SessionRepository,
  session: SessionRecord,
  now: Date,
  ttl: { kioskDays: number; standardDays: number },
): Promise<Date> {
  const newExpiresAt = computeExpiresAt(session.kind, now, ttl);
  await sessionRepository.updateExpiresAt(session.id, newExpiresAt);
  return newExpiresAt;
}
