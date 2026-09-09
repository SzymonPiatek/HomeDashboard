import type { Response } from "express";

export const SESSION_COOKIE_NAME = "session";

/** Max-Age odzwierciedla czas życia rekordu sesji — ADR-0003. */
export function setSessionCookie(
  res: Response,
  rawSessionId: string,
  ttlSeconds: number,
  cookieSecure: boolean,
): void {
  res.cookie(SESSION_COOKIE_NAME, rawSessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,
    path: "/",
    maxAge: ttlSeconds * 1000,
  });
}

export function clearSessionCookie(res: Response, cookieSecure: boolean): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,
    path: "/",
  });
}
