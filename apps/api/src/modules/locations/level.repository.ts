import { prisma } from "../../lib/prisma-client.js";
import { findOwnedLevel } from "./level-lookup.js";
import type { LevelRecord, LevelRepository } from "./locations.types.js";

/**
 * Jedyne miejsce w module, w którym `prisma.level` występuje bezpośrednio dla
 * operacji na poziomach — .claude/rules/api.md. Zależy od schematu `Level`
 * z `order`/`version`, który `data-engineer` dopiero wprowadza (ADR-0008).
 */
export function createLevelRepository(): LevelRepository {
  return {
    async countByLocationId(accountId, locationId) {
      const location = await prisma.location.findFirst({
        where: { id: locationId, accountId },
        select: { id: true },
      });
      if (!location) return null;

      return prisma.level.count({ where: { locationId } });
    },

    async create(accountId, locationId, name) {
      const location = await prisma.location.findFirst({
        where: { id: locationId, accountId },
        select: { id: true },
      });
      if (!location) return null;

      // `order` nadaje serwer: max(order) + 1, pierwszy poziom 0 — .claude/rules/locations.md.
      return prisma.$transaction(async (tx) => {
        const last = await tx.level.findFirst({
          where: { locationId },
          orderBy: { order: "desc" },
          select: { order: true },
        });
        const order = last ? last.order + 1 : 0;
        const level = await tx.level.create({ data: { locationId, name, order } });
        return toLevelRecord(level);
      });
    },

    async updateName(accountId, locationId, levelId, name) {
      const level = await findOwnedLevel(accountId, locationId, levelId);
      if (!level) return null;

      const updated = await prisma.level.update({ where: { id: levelId }, data: { name } });
      return toLevelRecord(updated);
    },

    async delete(accountId, locationId, levelId) {
      const level = await findOwnedLevel(accountId, locationId, levelId);
      if (!level) return false;

      await prisma.level.delete({ where: { id: levelId } });
      return true;
    },
  };
}

function toLevelRecord(level: {
  id: string;
  name: string;
  order: number;
  version: number;
}): LevelRecord {
  return { id: level.id, name: level.name, order: level.order, version: level.version };
}
