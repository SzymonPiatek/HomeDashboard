import type { Response } from "express";

import { setSessionCookie } from "./session-cookie.js";
import { extendSession, shouldExtendSession, sessionTtlDays } from "./session.service.js";
import type { SessionRecord, SessionRepository } from "./auth.types.js";

export type ExtendSessionIfNeededParams = {
  sessionRepository: SessionRepository;
  session: SessionRecord;
  rawSessionId: string;
  now: Date;
  sessionTtl: { kioskDays: number; standardDays: number };
  cookieSecure: boolean;
  res: Response;
};

/**
 * Przedłuża sesję i odświeża ciasteczko, gdy zostało mniej niż połowa czasu
 * życia (ADR-0003). Współdzielone przez requireSession i GET /session, żeby
 * sesja kioskowa odświeżała się też na endpoincie, który tablet odpytuje
 * na bieżąco, a nie tylko przy żądaniach chronionych.
 */
export async function extendSessionIfNeeded(params: ExtendSessionIfNeededParams): Promise<void> {
  const { sessionRepository, session, rawSessionId, now, sessionTtl, cookieSecure, res } = params;
  if (!shouldExtendSession(session, now, sessionTtl)) return;

  await extendSession(sessionRepository, session, now, sessionTtl);
  setSessionCookie(
    res,
    rawSessionId,
    sessionTtlDays(session.kind, sessionTtl) * 24 * 60 * 60,
    cookieSecure,
  );
}
