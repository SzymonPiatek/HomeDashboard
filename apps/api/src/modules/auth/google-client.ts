import { z } from "zod";

const GOOGLE_AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

/** Każde wywołanie Google ma timeout — .claude/rules/api.md. */
const GOOGLE_REQUEST_TIMEOUT_MS = 5000;

export class GoogleRequestError extends Error {}

export function buildGoogleAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  // Bez access_type=offline — nie żądamy refresh tokena (ADR-0001).
  url.searchParams.set("scope", "openid email");
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
});

export type GoogleTokens = { accessToken: string };

export async function exchangeCodeForToken(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
}): Promise<GoogleTokens> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    code: params.code,
    code_verifier: params.codeVerifier,
    grant_type: "authorization_code",
  });

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
  }).catch((error: unknown) => {
    throw new GoogleRequestError(`token exchange request failed: ${String(error)}`);
  });

  if (!response.ok) {
    throw new GoogleRequestError(`token exchange responded with status ${response.status}`);
  }

  const parsed = tokenResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new GoogleRequestError("token exchange response shape invalid");

  return { accessToken: parsed.data.access_token };
}

const userInfoResponseSchema = z.object({
  sub: z.string().min(1),
  email: z.string().min(1),
  email_verified: z.boolean(),
});

export type GoogleUserInfo = { sub: string; email: string; emailVerified: boolean };

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
  }).catch((error: unknown) => {
    throw new GoogleRequestError(`userinfo request failed: ${String(error)}`);
  });

  if (!response.ok) {
    throw new GoogleRequestError(`userinfo responded with status ${response.status}`);
  }

  const parsed = userInfoResponseSchema.safeParse(await response.json());
  if (!parsed.success) throw new GoogleRequestError("userinfo response shape invalid");

  return {
    sub: parsed.data.sub,
    email: parsed.data.email,
    emailVerified: parsed.data.email_verified,
  };
}
