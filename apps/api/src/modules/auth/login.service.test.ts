import { describe, expect, it, vi } from "vitest";

import type { GoogleUserInfo } from "./google-client.js";
import { completeGoogleLogin, GoogleLoginDeniedError } from "./login.service.js";
import { createFakeAccountRepository, createFakeSessionRepository } from "./test-support/fakes.js";
import type { LoginConfig } from "./login.service.js";

const CONFIG: LoginConfig = {
  clientId: "client-id",
  clientSecret: "client-secret",
  redirectUri: "http://localhost:3000/api/auth/google/callback",
  ownerEmail: "owner@example.com",
  sessionTtl: { kioskDays: 180, standardDays: 7 },
};

function buildDeps(userInfo: GoogleUserInfo, now = new Date("2026-09-09T12:00:00Z")) {
  const accountRepository = createFakeAccountRepository();
  const sessionRepository = createFakeSessionRepository();

  return {
    deps: {
      config: CONFIG,
      accountRepository: accountRepository.repository,
      sessionRepository: sessionRepository.repository,
      exchangeCodeForToken: vi.fn().mockResolvedValue({ accessToken: "google-access-token" }),
      fetchGoogleUserInfo: vi.fn().mockResolvedValue(userInfo),
      now: () => now,
    },
    accountRepository,
    sessionRepository,
  };
}

describe("completeGoogleLogin", () => {
  it("odrzuca konto z niezweryfikowanym adresem e-mail", async () => {
    const { deps } = buildDeps({ sub: "sub-1", email: "owner@example.com", emailVerified: false });

    await expect(
      completeGoogleLogin(deps, { code: "code", codeVerifier: "verifier", device: "standard" }),
    ).rejects.toThrow(GoogleLoginDeniedError);
  });

  it("odrzuca adres spoza OWNER_EMAIL, mimo zweryfikowanego e-maila", async () => {
    const { deps, accountRepository } = buildDeps({
      sub: "sub-intruz",
      email: "intruz@example.com",
      emailVerified: true,
    });

    await expect(
      completeGoogleLogin(deps, { code: "code", codeVerifier: "verifier", device: "standard" }),
    ).rejects.toThrow(GoogleLoginDeniedError);
    expect(accountRepository.accounts.size).toBe(0);
  });

  it("tworzy konto i sesję dla właściciela przy pierwszym logowaniu", async () => {
    const { deps, accountRepository, sessionRepository } = buildDeps({
      sub: "sub-owner",
      email: "Owner@Example.com",
      emailVerified: true,
    });

    const { rawSessionId, session } = await completeGoogleLogin(deps, {
      code: "code",
      codeVerifier: "verifier",
      device: "kiosk",
    });

    expect(rawSessionId).toHaveLength(43);
    expect(session.kind).toBe("kiosk");
    expect(accountRepository.accounts.get("sub-owner")?.email).toBe("owner@example.com");
    expect(sessionRepository.sessions.size).toBe(1);
  });

  it("aktualizuje e-mail konta przy kolejnym logowaniu tym samym googleSub", async () => {
    const { deps, accountRepository } = buildDeps({
      sub: "sub-owner",
      email: "owner@example.com",
      emailVerified: true,
    });
    accountRepository.accounts.set("sub-owner", {
      id: "existing-account",
      email: "stary-adres@example.com",
      googleSub: "sub-owner",
    });

    const { session } = await completeGoogleLogin(deps, {
      code: "code",
      codeVerifier: "verifier",
      device: "standard",
    });

    expect(session.accountId).toBe("existing-account");
    expect(accountRepository.accounts.get("sub-owner")?.email).toBe("owner@example.com");
  });
});
