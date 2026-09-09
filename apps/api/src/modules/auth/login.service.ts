import type { Device } from "./device.js";
import { normalizeEmail } from "./email.js";
import type { exchangeCodeForToken, fetchGoogleUserInfo, GoogleUserInfo } from "./google-client.js";
import { computeExpiresAt } from "./session.service.js";
import { generateSessionId, hashSessionId } from "./session-token.js";
import type { AccountRepository, SessionRecord, SessionRepository } from "./auth.types.js";

/** Raison d'être interne, logowana bez PII — nigdy zwracana klientowi (ADR-0001). */
export class GoogleLoginDeniedError extends Error {}

export type LoginConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  ownerEmail: string;
  sessionTtl: { kioskDays: number; standardDays: number };
};

export type LoginDeps = {
  config: LoginConfig;
  accountRepository: AccountRepository;
  sessionRepository: SessionRepository;
  exchangeCodeForToken: typeof exchangeCodeForToken;
  fetchGoogleUserInfo: typeof fetchGoogleUserInfo;
  now: () => Date;
};

function verifyOwnerIdentity(userInfo: GoogleUserInfo, ownerEmail: string): void {
  if (!userInfo.emailVerified) throw new GoogleLoginDeniedError("email_not_verified");
  if (normalizeEmail(userInfo.email) !== normalizeEmail(ownerEmail)) {
    throw new GoogleLoginDeniedError("email_not_allowlisted");
  }
}

export async function completeGoogleLogin(
  deps: LoginDeps,
  params: { code: string; codeVerifier: string; device: Device },
): Promise<{ rawSessionId: string; session: SessionRecord }> {
  const tokens = await deps.exchangeCodeForToken({
    clientId: deps.config.clientId,
    clientSecret: deps.config.clientSecret,
    redirectUri: deps.config.redirectUri,
    code: params.code,
    codeVerifier: params.codeVerifier,
  });

  const userInfo = await deps.fetchGoogleUserInfo(tokens.accessToken);
  verifyOwnerIdentity(userInfo, deps.config.ownerEmail);

  const account = await deps.accountRepository.upsertByGoogleSub({
    googleSub: userInfo.sub,
    email: normalizeEmail(userInfo.email),
  });

  const now = deps.now();
  const rawSessionId = generateSessionId();
  const session = await deps.sessionRepository.create({
    accountId: account.id,
    tokenHash: hashSessionId(rawSessionId),
    kind: params.device,
    expiresAt: computeExpiresAt(params.device, now, deps.config.sessionTtl),
  });

  return { rawSessionId, session };
}
