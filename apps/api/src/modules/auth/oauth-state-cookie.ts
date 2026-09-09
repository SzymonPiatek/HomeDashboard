import type { Response } from "express";
import { z } from "zod";

import { deviceSchema } from "./device.js";

export const OAUTH_STATE_COOKIE_NAME = "oauth_state";
const OAUTH_STATE_COOKIE_MAX_AGE_SECONDS = 10 * 60;

const oauthStatePayloadSchema = z.object({
  state: z.string().min(1),
  codeVerifier: z.string().min(1),
  device: deviceSchema,
});

export type OAuthStatePayload = z.infer<typeof oauthStatePayloadSchema>;

/** Ciasteczko krótko żyjące (10 min), HttpOnly — nosi state, PKCE i device (ADR-0001). */
export function setOAuthStateCookie(
  res: Response,
  payload: OAuthStatePayload,
  cookieSecure: boolean,
): void {
  res.cookie(OAUTH_STATE_COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,
    path: "/api/auth/google",
    maxAge: OAUTH_STATE_COOKIE_MAX_AGE_SECONDS * 1000,
  });
}

export function clearOAuthStateCookie(res: Response, cookieSecure: boolean): void {
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure,
    path: "/api/auth/google",
  });
}

/** Zwraca `null` zamiast rzucać — wywołujący traktuje to jak każdą inną porażkę logowania. */
export function readOAuthStateCookie(rawCookieValue: string | undefined): OAuthStatePayload | null {
  if (!rawCookieValue) return null;

  try {
    const parsed = oauthStatePayloadSchema.safeParse(JSON.parse(rawCookieValue));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
