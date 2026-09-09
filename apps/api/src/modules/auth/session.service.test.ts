import { describe, expect, it } from "vitest";

import { computeExpiresAt, lookupSession, shouldExtendSession } from "./session.service.js";
import { hashSessionId } from "./session-token.js";
import { buildFakeSession, createFakeSessionRepository } from "./test-support/fakes.js";
import type { AccountRecord } from "./auth.types.js";

const TTL = { kioskDays: 180, standardDays: 7 };
const OWNER_EMAIL = "owner@example.com";
const OWNER: AccountRecord = { id: "acc-1", email: OWNER_EMAIL, googleSub: "google-sub-1" };

describe("lookupSession", () => {
  it("zwraca 'missing', gdy brak ciasteczka", async () => {
    const { repository } = createFakeSessionRepository();

    const result = await lookupSession(repository, undefined, {
      now: new Date(),
      ownerEmail: OWNER_EMAIL,
    });

    expect(result.status).toBe("missing");
  });

  it("zwraca 'not-found', gdy rekord nie istnieje", async () => {
    const { repository } = createFakeSessionRepository();

    const result = await lookupSession(repository, "raw-id-nieistniejaca", {
      now: new Date(),
      ownerEmail: OWNER_EMAIL,
    });

    expect(result.status).toBe("not-found");
  });

  it("zwraca 'expired', gdy sesja wygasła", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-expired";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(now.getTime() - 1000),
    });
    const { repository } = createFakeSessionRepository([session]);

    const result = await lookupSession(repository, rawId, { now, ownerEmail: OWNER_EMAIL });

    expect(result).toEqual({ status: "expired", sessionId: session.id });
  });

  it("zwraca 'not-allowlisted', gdy adres konta nie jest OWNER_EMAIL", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-other-account";
    const other: AccountRecord = { id: "acc-2", email: "intruz@example.com", googleSub: "sub-2" };
    const session = buildFakeSession({
      account: other,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(now.getTime() + 1000 * 60),
    });
    const { repository } = createFakeSessionRepository([session]);

    const result = await lookupSession(repository, rawId, { now, ownerEmail: OWNER_EMAIL });

    expect(result).toEqual({ status: "not-allowlisted", sessionId: session.id });
  });

  it("zwraca 'valid' dla nieprzedawnionej sesji właściciela", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-valid";
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(now.getTime() + 1000 * 60),
    });
    const { repository } = createFakeSessionRepository([session]);

    const result = await lookupSession(repository, rawId, { now, ownerEmail: OWNER_EMAIL });

    expect(result.status).toBe("valid");
  });

  it("normalizuje wielkość liter i białe znaki przy porównaniu z OWNER_EMAIL", async () => {
    const now = new Date("2026-09-09T12:00:00Z");
    const rawId = "raw-normalized";
    const account: AccountRecord = {
      id: "acc-3",
      email: "  Owner@Example.com  ",
      googleSub: "sub-3",
    };
    const session = buildFakeSession({
      account,
      tokenHash: hashSessionId(rawId),
      expiresAt: new Date(now.getTime() + 1000 * 60),
    });
    const { repository } = createFakeSessionRepository([session]);

    const result = await lookupSession(repository, rawId, { now, ownerEmail: OWNER_EMAIL });

    expect(result.status).toBe("valid");
  });
});

describe("shouldExtendSession", () => {
  it("nie przedłuża, gdy zostało więcej niż połowa czasu życia", () => {
    const now = new Date("2026-09-09T00:00:00Z");
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: "hash",
      kind: "standard",
      expiresAt: computeExpiresAt("standard", now, TTL),
    });

    expect(shouldExtendSession(session, now, TTL)).toBe(false);
  });

  it("przedłuża, gdy zostało mniej niż połowa czasu życia", () => {
    const now = new Date("2026-09-09T00:00:00Z");
    const almostExpired = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 1 dzień z 7
    const session = buildFakeSession({
      account: OWNER,
      tokenHash: "hash",
      kind: "standard",
      expiresAt: almostExpired,
    });

    expect(shouldExtendSession(session, now, TTL)).toBe(true);
  });
});
