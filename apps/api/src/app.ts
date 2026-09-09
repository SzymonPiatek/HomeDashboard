import express, { type Express } from "express";

import type { Env } from "./config/env.js";
import { cookies } from "./http/cookies.js";
import { errorHandler, notFoundHandler } from "./http/error-handler.js";
import { requestId } from "./http/request-id.js";
import { createAccountRepository } from "./modules/auth/account.repository.js";
import { createAuthRouter } from "./modules/auth/auth.route.js";
import type { AccountRepository, SessionRepository } from "./modules/auth/auth.types.js";
import { createSessionRepository } from "./modules/auth/session.repository.js";
import { createHealthRouter } from "./modules/health/health.route.js";

export type AppDependencies = {
  env: Env;
  accountRepository?: AccountRepository;
  sessionRepository?: SessionRepository;
};

/** Prefiks /api obsługuje samo API, proxy go nie obcina — .claude/rules/auth.md. */
export function createApp(deps: AppDependencies): Express {
  const app = express();
  const accountRepository = deps.accountRepository ?? createAccountRepository();
  const sessionRepository = deps.sessionRepository ?? createSessionRepository();

  app.disable("x-powered-by");
  app.use(requestId);
  app.use(express.json());
  app.use(cookies);
  app.use("/api", createHealthRouter());
  app.use("/api/auth", createAuthRouter({ env: deps.env, accountRepository, sessionRepository }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
