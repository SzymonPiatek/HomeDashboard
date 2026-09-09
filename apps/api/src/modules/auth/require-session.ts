import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../../http/api-error.js";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "./session-cookie.js";
import { extendSessionIfNeeded } from "./session-extension.js";
import { lookupSession } from "./session.service.js";
import type { SessionRepository } from "./auth.types.js";

export type RequireSessionDeps = {
  sessionRepository: SessionRepository;
  ownerEmail: string;
  sessionTtl: { kioskDays: number; standardDays: number };
  cookieSecure: boolean;
  now?: () => Date;
  /**
   * Domyślnie true. Wyłącz tylko tam, gdzie sesja i tak zaraz zostanie
   * skasowana (np. /logout) — przedłużanie jej tuż przed usunięciem jest
   * zbędnym zapisem do bazy i zbędnym Set-Cookie.
   */
  extendExpiry?: boolean;
};

/**
 * Jedyne źródło tożsamości żądania poza modułem auth (ADR-0003). Sprawdza przy
 * każdym żądaniu: rekord istnieje, nie wygasł, konto jest na białej liście.
 */
export function createRequireSession(deps: RequireSessionDeps) {
  return async function requireSession(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const now = (deps.now ?? (() => new Date()))();
    const result = await lookupSession(deps.sessionRepository, req.cookies[SESSION_COOKIE_NAME], {
      now,
      ownerEmail: deps.ownerEmail,
    });

    if (result.status === "expired" || result.status === "not-allowlisted") {
      await deps.sessionRepository.deleteById(result.sessionId);
    }

    if (result.status !== "valid") {
      clearSessionCookie(res, deps.cookieSecure);
      next(new ApiError(401, "UNAUTHENTICATED", "Wymagane zalogowanie"));
      return;
    }

    req.auth = {
      accountId: result.account.id,
      email: result.account.email,
      sessionId: result.session.id,
    };

    if (deps.extendExpiry ?? true) {
      await extendSessionIfNeeded({
        sessionRepository: deps.sessionRepository,
        session: result.session,
        rawSessionId: req.cookies[SESSION_COOKIE_NAME],
        now,
        sessionTtl: deps.sessionTtl,
        cookieSecure: deps.cookieSecure,
        res,
      });
    }

    next();
  };
}
