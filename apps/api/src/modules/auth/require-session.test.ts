import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { createRequireSession } from "./require-session.js";
import { hashSessionId } from "./session-token.js";
import { buildFakeSession, createFakeSessionRepository } from "./test-support/fakes.js";
import type { AccountRecord } from "./auth.types.js";

const TTL = { kioskDays: 180, standardDays: 7 };
const OWNER_EMAIL = "owner@example.com";
const OWNER: AccountRecord = { id: "acc-1", email: OWNER_EMAIL, googleSub: "google-sub-1" };

function fakeReqRes(cookieValue: string | undefined) {
  const req = { cookies: cookieValue ? { session: cookieValue } : {} } as unknown as Request;
  const cookieCalls: unknown[] = [];
  const clearCalls: unknown[] = [];
  const res = {
    cookie: vi.fn((...args: unknown[]) => cookieCalls.push(args)),
    clearCookie: vi.fn((...args: unknown[]) => clearCalls.push(args)),
  } as unknown as Response;
  return { req, res, cookieCalls, clearCalls };
}

describe("requireSession", () => {
  it("odrzuca żądanie bez ciasteczka sesji", async () => {
    const { repository } = createFakeSessionRepository();
    const requireSession = createRequireSession({
      sessionRepository: repository,
      ownerEmail: OWNER_EMAIL,
      sessionTtl: TTL,
      cookieSecure: false,
    });
    const { req, res, clearCalls } = fakeReqRes(undefined);
    const next = vi.fn();

    await requireSession(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, code: "UNAUTHENTICATED" }),
    );
    expect(clearCalls).toHaveLength(1);
  });

  it("odrzuca i kasuje rekord wygasłej sesji", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-expired";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(now.getTime() - 1000),
    });
    const { repository, sessions } = createFakeSessionRepository([session]);
    const requireSession = createRequireSession({
      sessionRepository: repository,
      ownerEmail: OWNER_EMAIL,
      sessionTtl: TTL,
      cookieSecure: false,
      now: () => now,
    });
    const { req, res } = fakeReqRes(rawId);
    const next = vi.fn();

    await requireSession(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
    expect(sessions.size).toBe(0);
  });

  it("odrzuca sesję konta spoza białej listy i kasuje rekord", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-not-owner";
    const intruder: AccountRecord = {
      id: "acc-2",
      email: "intruz@example.com",
      googleSub: "sub-2",
    };
    const session = buildFakeSession({
      account: intruder,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(now.getTime() + 60_000),
    });
    const { repository, sessions } = createFakeSessionRepository([session]);
    const requireSession = createRequireSession({
      sessionRepository: repository,
      ownerEmail: OWNER_EMAIL,
      sessionTtl: TTL,
      cookieSecure: false,
      now: () => now,
    });
    const { req, res } = fakeReqRes(rawId);
    const next = vi.fn();

    await requireSession(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
    expect(sessions.size).toBe(0);
  });

  it("wpuszcza żądanie z ważną sesją i ustawia req.auth", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-valid";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      kind: "standard",
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 6), // niedaleko połowy TTL
    });
    const { repository } = createFakeSessionRepository([session]);
    const requireSession = createRequireSession({
      sessionRepository: repository,
      ownerEmail: OWNER_EMAIL,
      sessionTtl: TTL,
      cookieSecure: false,
      now: () => now,
    });
    const { req, res } = fakeReqRes(rawId);
    const next = vi.fn();

    await requireSession(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.auth).toEqual({ accountId: OWNER.id, email: OWNER.email, sessionId: session.id });
  });

  it("przedłuża sesję, gdy zostało mniej niż połowa czasu życia", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-almost-expired";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      kind: "standard",
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24), // 1 dzień z 7
    });
    const originalExpiresAt = session.expiresAt.getTime();
    const { repository, sessions } = createFakeSessionRepository([session]);
    const requireSession = createRequireSession({
      sessionRepository: repository,
      ownerEmail: OWNER_EMAIL,
      sessionTtl: TTL,
      cookieSecure: false,
      now: () => now,
    });
    const { req, res, cookieCalls } = fakeReqRes(rawId);
    const next = vi.fn();

    await requireSession(req, res, next);

    expect(cookieCalls).toHaveLength(1);
    const storedSession = [...sessions.values()].find((s) => s.tokenHash === hashSessionId(rawId));
    expect(storedSession?.expiresAt.getTime()).toBeGreaterThan(originalExpiresAt);
  });
});
