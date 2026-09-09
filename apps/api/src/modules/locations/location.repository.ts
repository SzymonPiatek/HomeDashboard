import { prisma } from "../../lib/prisma-client.js";
import type {
  LocationRecord,
  LocationRepository,
  LocationWithLevelCount,
} from "./locations.types.js";

type LocationRow = { id: string; name: string; createdAt: Date };
type LocationRowWithLevelCount = LocationRow & { _count: { levels: number } };

/**
 * Jedyne miejsce w module, w którym `prisma.location` występuje bezpośrednio
 * — .claude/rules/api.md. Zależy od schematu `Location`/`Level`, który
 * `data-engineer` dopiero wprowadza (ADR-0008) — patrz raport backend-dev.
 */
export function createLocationRepository(): LocationRepository {
  return {
    async countByAccountId(accountId) {
      return prisma.location.count({ where: { accountId } });
    },

    async listByAccountId(accountId, { limit, cursor }) {
      const rows: LocationRowWithLevelCount[] = await prisma.location.findMany({
        where: { accountId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: { _count: { select: { levels: true } } },
      });

      const hasMore = rows.length > limit;
      const page = hasMore ? rows.slice(0, limit) : rows;
      const items = page.map(toLocationWithLevelCount);
      const nextCursor = hasMore ? (items.at(-1)?.id ?? null) : null;

      return { items, nextCursor };
    },

    async create(accountId, name) {
      const location = await prisma.location.create({ data: { accountId, name } });
      return toLocationRecord(location);
    },

    async findDetailById(accountId, locationId) {
      const location = await prisma.location.findFirst({
        where: { id: locationId, accountId },
        include: { levels: { orderBy: [{ order: "asc" }, { id: "asc" }] } },
      });
      if (!location) return null;

      return {
        ...toLocationRecord(location),
        levels: location.levels.map((level: { id: string; name: string; order: number }) => ({
          id: level.id,
          name: level.name,
          order: level.order,
        })),
      };
    },

    async updateName(accountId, locationId, name) {
      const { count } = await prisma.location.updateMany({
        where: { id: locationId, accountId },
        data: { name },
      });
      if (count === 0) return null;

      const location = await prisma.location.findFirst({ where: { id: locationId, accountId } });
      return location ? toLocationRecord(location) : null;
    },

    async delete(accountId, locationId) {
      const { count } = await prisma.location.deleteMany({ where: { id: locationId, accountId } });
      return count > 0;
    },
  };
}

function toLocationRecord(location: LocationRow): LocationRecord {
  return { id: location.id, name: location.name, createdAt: location.createdAt };
}

function toLocationWithLevelCount(location: LocationRowWithLevelCount): LocationWithLevelCount {
  return { ...toLocationRecord(location), levelCount: location._count.levels };
}
