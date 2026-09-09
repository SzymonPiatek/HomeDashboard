import type { Request, Response, Router } from "express";
import { z } from "zod";

import { ApiError } from "../../http/api-error.js";
import { readRequestId } from "../../http/request-id.js";
import { mapZodIssues } from "../../http/validation.js";
import type { RouterContext } from "./auth-router-context.js";
import { startQuerySchema } from "./device.js";
import { buildGoogleAuthorizationUrl, GoogleRequestError } from "./google-client.js";
import { completeGoogleLogin, GoogleLoginDeniedError } from "./login.service.js";
import {
  clearOAuthStateCookie,
  OAUTH_STATE_COOKIE_NAME,
  readOAuthStateCookie,
  setOAuthStateCookie,
} from "./oauth-state-cookie.js";
import { computeCodeChallenge, generateCodeVerifier, generateOAuthState } from "./pkce.js";
import { setSessionCookie } from "./session-cookie.js";
import { sessionTtlDays } from "./session.service.js";

function classifyLoginFailure(error: unknown): string {
  if (error instanceof GoogleLoginDeniedError) return error.message;
  if (error instanceof GoogleRequestError) return "google_request_failed";
  return "unexpected_error";
}

const callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

export function registerStartRoute(router: Router, ctx: RouterContext): void {
  router.get("/google/start", (req, res) => {
    const parsed = startQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_FAILED",
        "Nieprawidłowy parametr device",
        mapZodIssues(parsed.error),
      );
    }

    const state = generateOAuthState();
    const codeVerifier = generateCodeVerifier();
    setOAuthStateCookie(res, { state, codeVerifier, device: parsed.data.device }, ctx.cookieSecure);

    res.redirect(
      302,
      buildGoogleAuthorizationUrl({
        clientId: ctx.deps.env.GOOGLE_CLIENT_ID,
        redirectUri: ctx.deps.env.GOOGLE_REDIRECT_URI,
        state,
        codeChallenge: computeCodeChallenge(codeVerifier),
      }),
    );
  });
}

async function handleCallback(req: Request, res: Response, ctx: RouterContext): Promise<void> {
  const query = callbackQuerySchema.parse(req.query);
  if (query.error || !query.code || !query.state) {
    throw new GoogleLoginDeniedError("missing_or_error_query");
  }

  const statePayload = readOAuthStateCookie(req.cookies[OAUTH_STATE_COOKIE_NAME]);
  if (!statePayload || statePayload.state !== query.state) {
    throw new GoogleLoginDeniedError("invalid_state");
  }

  const { rawSessionId, session } = await completeGoogleLogin(ctx.loginDeps, {
    code: query.code,
    codeVerifier: statePayload.codeVerifier,
    device: statePayload.device,
  });

  clearOAuthStateCookie(res, ctx.cookieSecure);
  setSessionCookie(
    res,
    rawSessionId,
    sessionTtlDays(session.kind, ctx.sessionTtl) * 24 * 60 * 60,
    ctx.cookieSecure,
  );
  res.redirect(302, "/");
}

export function registerCallbackRoute(router: Router, ctx: RouterContext): void {
  router.get("/google/callback", async (req, res) => {
    try {
      await handleCallback(req, res, ctx);
    } catch (error) {
      console.warn(
        JSON.stringify({
          level: "warn",
          msg: "google login denied",
          requestId: readRequestId(res),
          reason: classifyLoginFailure(error),
        }),
      );
      clearOAuthStateCookie(res, ctx.cookieSecure);
      res.redirect(302, "/login?error=access_denied");
    }
  });
}
