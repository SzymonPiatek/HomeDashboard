import { createHash, randomBytes } from "node:crypto";

/** PKCE ręcznie — wariant A z ADR-0001, bez biblioteki OAuth. */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function computeCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function generateOAuthState(): string {
  return randomBytes(16).toString("base64url");
}
