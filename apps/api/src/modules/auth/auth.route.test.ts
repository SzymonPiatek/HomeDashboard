import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { cookies } from "../../http/cookies.js";
import { errorHandler } from "../../http/error-handler.js";
import type { AuthRouterDeps } from "./auth.route.js";
import { createAuthRouter } from "./auth.route.js";
import { hashSessionId } from "./session-token.js";
import {
  buildFakeSession,
  createFakeAccountRepository,
  createFakeSessionRepository,
} from "./test-support/fakes.js";
import type { AccountRecord } from "./auth.types.js";

const OWNER_EMAIL = "owner@example.com";
const OWNER: AccountRecord = { id: "acc-1", email: OWNER_EMAIL, googleSub: "google-sub-1" };

function requireSetCookie(headers: Record<string, unknown>): string[] {
  const setCookie = headers["set-cookie"];
  if (!Array.isArray(setCookie) || setCookie.length === 0) {
    throw new Error("expected at least one Set-Cookie header in the test response");
  }
  return setCookie;
}

function firstStateCookie(headers: Record<string, unknown>): string {
  const [cookie] = requireSetCookie(headers);
  if (!cookie) throw new Error("expected oauth_state cookie");
  return cookie;
}

function decodeStateFromCookie(stateCookie: string): { state: string } {
  const pair = stateCookie.split(";")[0];
  const value = pair?.split("=")[1];
  if (!value) throw new Error("malformed oauth_state cookie in test");
  return JSON.parse(decodeURIComponent(value)) as { state: string };
}

function buildTestApp(overrides: Partial<AuthRouterDeps> = {}) {
  const accountRepository = createFakeAccountRepository();
  const sessionRepository = createFakeSessionRepository();

  const deps: AuthRouterDeps = {
    env: {
      GOOGLE_CLIENT_ID: "client-id",
      GOOGLE_CLIENT_SECRET: "client-secret",
      GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
      OWNER_EMAIL,
      SESSION_TTL_KIOSK_DAYS: 180,
      SESSION_TTL_STANDARD_DAYS: 7,
      COOKIE_SECURE: false,
    },
    accountRepository: accountRepository.repository,
    sessionRepository: sessionRepository.repository,
    ...overrides,
  };

  const app = express();
  app.use(cookies);
  app.use("/api/auth", createAuthRouter(deps));
  app.use(errorHandler);

  return { app, accountRepository, sessionRepository };
}

describe("GET /api/auth/google/start", () => {
  it("odrzuca device spoza zamkniętej listy kodem 400", async () => {
    const { app } = buildTestApp();

    const response = await request(app).get("/api/auth/google/start?device=laptop");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("przekierowuje do Google i ustawia ciasteczko stanu dla poprawnego device", async () => {
    const { app } = buildTestApp();

    const response = await request(app).get("/api/auth/google/start?device=kiosk");

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("accounts.google.com");
    expect(response.headers.location).toContain("code_challenge_method=S256");
    expect(requireSetCookie(response.headers)[0]).toContain("oauth_state=");
  });
});

describe("GET /api/auth/google/callback", () => {
  it("przekierowuje na /login?error=access_denied, gdy brak parametru code", async () => {
    const { app } = buildTestApp();

    const response = await request(app).get("/api/auth/google/callback?state=xyz");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login?error=access_denied");
  });

  it("przekierowuje na /login?error=access_denied, gdy adres poza OWNER_EMAIL", async () => {
    const start = await request(buildTestApp().app).get("/api/auth/google/start?device=standard");
    const stateCookie = firstStateCookie(start.headers);

    const { app } = buildTestApp({
      fetchGoogleUserInfo: vi.fn().mockResolvedValue({
        sub: "sub-intruz",
        email: "intruz@example.com",
        emailVerified: true,
      }),
      exchangeCodeForToken: vi.fn().mockResolvedValue({ accessToken: "token" }),
    });

    const decodedState = decodeStateFromCookie(stateCookie);

    const response = await request(app)
      .get(`/api/auth/google/callback?code=abc&state=${decodedState.state}`)
      .set("Cookie", stateCookie);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login?error=access_denied");
  });

  it("loguje właściciela i przekierowuje na / przy poprawnym przepływie", async () => {
    const { app: startApp } = buildTestApp();
    const start = await request(startApp).get("/api/auth/google/start?device=standard");
    const stateCookie = firstStateCookie(start.headers);
    const decodedState = decodeStateFromCookie(stateCookie);

    const { app, sessionRepository } = buildTestApp({
      fetchGoogleUserInfo: vi.fn().mockResolvedValue({
        sub: "sub-owner",
        email: OWNER_EMAIL,
        emailVerified: true,
      }),
      exchangeCodeForToken: vi.fn().mockResolvedValue({ accessToken: "token" }),
    });

    const response = await request(app)
      .get(`/api/auth/google/callback?code=abc&state=${decodedState.state}`)
      .set("Cookie", stateCookie);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/");
    expect(requireSetCookie(response.headers).some((c) => c.startsWith("session="))).toBe(true);
    expect(sessionRepository.sessions.size).toBe(1);
  });
});

describe("GET /api/auth/session", () => {
  it("zwraca 200 authenticated=false bez ciasteczka", async () => {
    const { app } = buildTestApp();

    const response = await request(app).get("/api/auth/session");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: false });
  });

  it("zwraca 200 authenticated=true dla ważnej sesji właściciela", async () => {
    const rawId = "raw-owner-session";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    const { app } = buildTestApp({
      sessionRepository: createFakeSessionRepository([session]).repository,
    });

    const response = await request(app).get("/api/auth/session").set("Cookie", `session=${rawId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: true, email: OWNER_EMAIL });
  });

  it("przedłuża sesję i ciasteczko, gdy zostało mniej niż połowa czasu życia", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-almost-expired-session-check";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      kind: "standard",
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24), // 1 dzień z 7
    });
    const originalExpiresAt = session.expiresAt.getTime();
    const sessionRepository = createFakeSessionRepository([session]);
    const { app } = buildTestApp({
      sessionRepository: sessionRepository.repository,
      now: () => now,
    });

    const response = await request(app).get("/api/auth/session").set("Cookie", `session=${rawId}`);

    expect(response.status).toBe(200);
    expect(requireSetCookie(response.headers).some((c) => c.startsWith("session="))).toBe(true);
    const stored = [...sessionRepository.sessions.values()].find(
      (s) => s.tokenHash === hashSessionId(rawId),
    );
    expect(stored?.expiresAt.getTime()).toBeGreaterThan(originalExpiresAt);
  });

  it("nie ujawnia różnicy między kontem spoza listy a brakiem sesji", async () => {
    const rawId = "raw-intruder-session";
    const intruder: AccountRecord = {
      id: "acc-2",
      email: "intruz@example.com",
      googleSub: "sub-2",
    };
    const session = buildFakeSession({
      account: intruder,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    const { app } = buildTestApp({
      sessionRepository: createFakeSessionRepository([session]).repository,
    });

    const response = await request(app).get("/api/auth/session").set("Cookie", `session=${rawId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: false });
  });
});

describe("POST /api/auth/logout", () => {
  it("odrzuca żądanie bez ważnej sesji kodem 401", async () => {
    const { app } = buildTestApp();

    const response = await request(app).post("/api/auth/logout");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("kasuje sesję i czyści ciasteczko przy poprawnym wylogowaniu", async () => {
    const rawId = "raw-logout-session";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    const sessionRepository = createFakeSessionRepository([session]);
    const { app } = buildTestApp({ sessionRepository: sessionRepository.repository });

    const response = await request(app).post("/api/auth/logout").set("Cookie", `session=${rawId}`);

    expect(response.status).toBe(204);
    expect(sessionRepository.sessions.size).toBe(0);
    expect(requireSetCookie(response.headers).some((c) => c.startsWith("session=;"))).toBe(true);
  });

  it("nie przedłuża sesji bliskiej wygaśnięcia przed jej usunięciem", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-logout-almost-expired";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      kind: "standard",
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24), // 1 dzień z 7
    });
    const sessionRepository = createFakeSessionRepository([session]);
    const { app } = buildTestApp({
      sessionRepository: sessionRepository.repository,
      now: () => now,
    });

    const response = await request(app).post("/api/auth/logout").set("Cookie", `session=${rawId}`);

    expect(response.status).toBe(204);
    expect(sessionRepository.sessions.size).toBe(0);
    const setCookieHeaders = requireSetCookie(response.headers).filter((c) =>
      c.startsWith("session="),
    );
    expect(setCookieHeaders).toHaveLength(1);
    expect(setCookieHeaders[0]).toContain("session=;");
  });
});
