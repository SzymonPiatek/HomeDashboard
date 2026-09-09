import { randomUUID } from "node:crypto";

import type {
  AccountRecord,
  AccountRepository,
  SessionKind,
  SessionRecord,
  SessionRepository,
  SessionWithAccount,
} from "../auth.types.js";

export function createFakeAccountRepository(seed: AccountRecord[] = []) {
  const accounts = new Map(seed.map((account) => [account.googleSub, account]));

  const repository: AccountRepository = {
    async upsertByGoogleSub({ googleSub, email }) {
      const existing = accounts.get(googleSub);
      const account: AccountRecord = existing
        ? { ...existing, email }
        : { id: randomUUID(), email, googleSub };
      accounts.set(googleSub, account);
      return account;
    },
  };

  return { repository, accounts };
}

export function createFakeSessionRepository(seed: SessionWithAccount[] = []) {
  const sessions = new Map(seed.map((session) => [session.tokenHash, session]));

  const repository: SessionRepository = {
    async create({ accountId, tokenHash, kind, expiresAt }) {
      const account = [...sessions.values()].find((s) => s.account.id === accountId)?.account ?? {
        id: accountId,
        email: "unknown@example.com",
        googleSub: null,
      };
      const session: SessionWithAccount = {
        id: randomUUID(),
        accountId,
        tokenHash,
        kind,
        expiresAt,
        account,
      };
      sessions.set(tokenHash, session);
      return toSessionRecord(session);
    },

    async findByTokenHashWithAccount(tokenHash) {
      return sessions.get(tokenHash) ?? null;
    },

    async updateExpiresAt(id, expiresAt) {
      for (const session of sessions.values()) {
        if (session.id === id) session.expiresAt = expiresAt;
      }
    },

    async deleteById(id) {
      for (const [key, session] of sessions.entries()) {
        if (session.id === id) sessions.delete(key);
      }
    },
  };

  return { repository, sessions };
}

function toSessionRecord(session: SessionWithAccount): SessionRecord {
  return {
    id: session.id,
    accountId: session.accountId,
    tokenHash: session.tokenHash,
    kind: session.kind,
    expiresAt: session.expiresAt,
  };
}

export function buildFakeSession(params: {
  account: AccountRecord;
  tokenHash: string;
  kind?: SessionKind;
  expiresAt: Date;
}): SessionWithAccount {
  return {
    id: randomUUID(),
    accountId: params.account.id,
    tokenHash: params.tokenHash,
    kind: params.kind ?? "standard",
    expiresAt: params.expiresAt,
    account: params.account,
  };
}
