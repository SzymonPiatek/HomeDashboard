import { prisma } from "../../lib/prisma-client.js";
import type { AccountRecord, AccountRepository } from "./auth.types.js";

/** Jedyne miejsce w module auth, w którym występuje `prisma` — .claude/rules/api.md. */
export function createAccountRepository(): AccountRepository {
  return {
    async upsertByGoogleSub({ googleSub, email }): Promise<AccountRecord> {
      const account = await prisma.account.upsert({
        where: { googleSub },
        create: { googleSub, email },
        update: { email },
      });

      return { id: account.id, email: account.email, googleSub: account.googleSub };
    },
  };
}
