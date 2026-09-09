import { prisma } from "../../lib/prisma-client.js";
import type { SessionRecord, SessionRepository, SessionWithAccount } from "./auth.types.js";

/** Jedyne miejsce w module auth, w którym występuje `prisma` — .claude/rules/api.md. */
export function createSessionRepository(): SessionRepository {
  return {
    async create({ accountId, tokenHash, kind, expiresAt }): Promise<SessionRecord> {
      const session = await prisma.session.create({
        data: { accountId, tokenHash, kind, expiresAt },
      });

      return toSessionRecord(session);
    },

    async findByTokenHashWithAccount(tokenHash): Promise<SessionWithAccount | null> {
      const session = await prisma.session.findUnique({
        where: { tokenHash },
        include: { account: true },
      });
      if (!session) return null;

      return {
        ...toSessionRecord(session),
        account: {
          id: session.account.id,
          email: session.account.email,
          googleSub: session.account.googleSub,
        },
      };
    },

    async updateExpiresAt(id, expiresAt): Promise<void> {
      await prisma.session.update({ where: { id }, data: { expiresAt } });
    },

    async deleteById(id): Promise<void> {
      // Rekord może już nie istnieć (np. wylogowanie równoległe) — brak błędu jest oczekiwany.
      await prisma.session.deleteMany({ where: { id } });
    },
  };
}

function toSessionRecord(session: {
  id: string;
  accountId: string;
  tokenHash: string;
  kind: string;
  expiresAt: Date;
}): SessionRecord {
  return {
    id: session.id,
    accountId: session.accountId,
    tokenHash: session.tokenHash,
    kind: session.kind === "kiosk" ? "kiosk" : "standard",
    expiresAt: session.expiresAt,
  };
}
