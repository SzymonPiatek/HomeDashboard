import { prisma } from "../../lib/prisma-client.js";

/**
 * Jedyny sposób odnalezienia poziomu w module — pełny łańcuch własności
 * (locationId + location.accountId), nigdy `findUnique({ where: { id } })`
 * — .claude/rules/locations.md. Współdzielony przez level.repository.ts
 * i floor-plan.repository.ts, żeby nie duplikować zapytania z łańcuchem.
 */
export function findOwnedLevel(accountId: string, locationId: string, levelId: string) {
  return prisma.level.findFirst({ where: { id: levelId, locationId, location: { accountId } } });
}
