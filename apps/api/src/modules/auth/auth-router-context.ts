import type { AccountRepository, SessionRepository } from "./auth.types.js";
import { exchangeCodeForToken, fetchGoogleUserInfo } from "./google-client.js";
import type { LoginDeps } from "./login.service.js";

export type AuthRouterDeps = {
  env: {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    OWNER_EMAIL: string;
    SESSION_TTL_KIOSK_DAYS: number;
    SESSION_TTL_STANDARD_DAYS: number;
    COOKIE_SECURE: boolean;
  };
  accountRepository: AccountRepository;
  sessionRepository: SessionRepository;
  exchangeCodeForToken?: typeof exchangeCodeForToken;
  fetchGoogleUserInfo?: typeof fetchGoogleUserInfo;
  now?: () => Date;
};

/** Współdzielony przez auth.route.ts i google-oauth.route.ts — trzyma je bez importu wzajemnego. */
export type RouterContext = {
  deps: AuthRouterDeps;
  now: () => Date;
  cookieSecure: boolean;
  sessionTtl: { kioskDays: number; standardDays: number };
  loginDeps: LoginDeps;
};

export function buildContext(deps: AuthRouterDeps): RouterContext {
  const now = deps.now ?? (() => new Date());
  const sessionTtl = {
    kioskDays: deps.env.SESSION_TTL_KIOSK_DAYS,
    standardDays: deps.env.SESSION_TTL_STANDARD_DAYS,
  };

  return {
    deps,
    now,
    cookieSecure: deps.env.COOKIE_SECURE,
    sessionTtl,
    loginDeps: {
      config: {
        clientId: deps.env.GOOGLE_CLIENT_ID,
        clientSecret: deps.env.GOOGLE_CLIENT_SECRET,
        redirectUri: deps.env.GOOGLE_REDIRECT_URI,
        ownerEmail: deps.env.OWNER_EMAIL,
        sessionTtl,
      },
      accountRepository: deps.accountRepository,
      sessionRepository: deps.sessionRepository,
      exchangeCodeForToken: deps.exchangeCodeForToken ?? exchangeCodeForToken,
      fetchGoogleUserInfo: deps.fetchGoogleUserInfo ?? fetchGoogleUserInfo,
      now,
    },
  };
}
