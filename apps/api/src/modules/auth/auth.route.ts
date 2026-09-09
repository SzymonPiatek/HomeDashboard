import { authSessionSchema } from "@repo/contracts/auth";
import { Router } from "express";

import type { AuthRouterDeps, RouterContext } from "./auth-router-context.js";
import { buildContext } from "./auth-router-context.js";
import { registerCallbackRoute, registerStartRoute } from "./google-oauth.route.js";
import { createRequireSession } from "./require-session.js";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "./session-cookie.js";
import { extendSessionIfNeeded } from "./session-extension.js";
import { lookupSession } from "./session.service.js";

export type { AuthRouterDeps } from "./auth-router-context.js";

function registerSessionRoute(router: Router, ctx: RouterContext): void {
  // Publiczny świadomie: tablet go odpytuje, żeby ustalić, czy w ogóle jest
  // zalogowany — odpowiada 200 authenticated=false zamiast 401.
  router.get("/session", async (req, res) => {
    const now = ctx.now();
    const rawSessionId = req.cookies[SESSION_COOKIE_NAME];
    const result = await lookupSession(ctx.deps.sessionRepository, rawSessionId, {
      now,
      ownerEmail: ctx.deps.env.OWNER_EMAIL,
    });

    if (result.status === "valid") {
      await extendSessionIfNeeded({
        sessionRepository: ctx.deps.sessionRepository,
        session: result.session,
        rawSessionId,
        now,
        sessionTtl: ctx.sessionTtl,
        cookieSecure: ctx.cookieSecure,
        res,
      });
    }

    res.json(
      authSessionSchema.parse(
        result.status === "valid"
          ? { authenticated: true, email: result.account.email }
          : { authenticated: false },
      ),
    );
  });
}

function registerLogoutRoute(router: Router, ctx: RouterContext): void {
  // Sesja zaraz zostanie skasowana — przedłużanie jej tutaj byłoby zbędnym
  // zapisem, natychmiast unieważnionym przez usunięcie rekordu poniżej.
  const requireSession = createRequireSession({
    sessionRepository: ctx.deps.sessionRepository,
    ownerEmail: ctx.deps.env.OWNER_EMAIL,
    sessionTtl: ctx.sessionTtl,
    cookieSecure: ctx.cookieSecure,
    now: ctx.now,
    extendExpiry: false,
  });

  router.post("/logout", requireSession, async (req, res) => {
    if (req.auth) await ctx.deps.sessionRepository.deleteById(req.auth.sessionId);
    clearSessionCookie(res, ctx.cookieSecure);
    res.status(204).end();
  });
}

export function createAuthRouter(deps: AuthRouterDeps): Router {
  const router = Router();
  const ctx = buildContext(deps);

  registerStartRoute(router, ctx);
  registerCallbackRoute(router, ctx);
  registerSessionRoute(router, ctx);
  registerLogoutRoute(router, ctx);

  return router;
}
