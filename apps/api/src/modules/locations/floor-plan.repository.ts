import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma-client.js";
import { toRoomRecord, toWallRecord, wallToRowData } from "./floor-plan-mappers.js";
import { findOwnedLevel } from "./level-lookup.js";
import type {
  FloorPlanRepository,
  RoomInput,
  SavePlanResult,
  WallInput,
} from "./locations.types.js";

const planInclude = {
  walls: true,
  rooms: { include: { vertices: { orderBy: { position: "asc" as const } } } },
} satisfies Prisma.LevelInclude;

/**
 * Jedyne miejsce w module, w którym `prisma.wall`/`prisma.room`/`prisma.roomVertex`
 * występują bezpośrednio — .claude/rules/api.md. Zależy od schematu ściany jako
 * ośmiu kolumn Int (ADR-0010), który `data-engineer` dopiero wprowadza.
 */
export function createFloorPlanRepository(): FloorPlanRepository {
  return {
    async findLevel(accountId, locationId, levelId) {
      const level = await findOwnedLevel(accountId, locationId, levelId);
      return level ? { id: level.id } : null;
    },

    async getPlan(accountId, locationId, levelId) {
      const level = await prisma.level.findFirst({
        where: { id: levelId, locationId, location: { accountId } },
        include: planInclude,
      });
      if (!level) return null;

      return {
        version: level.version,
        walls: level.walls.map(toWallRecord),
        rooms: level.rooms.map(toRoomRecord),
      };
    },

    async savePlan({ accountId, locationId, levelId, expectedVersion, walls, rooms }) {
      const level = await findOwnedLevel(accountId, locationId, levelId);
      if (!level) return { status: "not-found" };

      return prisma.$transaction((tx) =>
        savePlanInTransaction(tx, { levelId, expectedVersion, walls, rooms }),
      );
    },
  };
}

async function savePlanInTransaction(
  tx: Prisma.TransactionClient,
  params: { levelId: string; expectedVersion: number; walls: WallInput[]; rooms: RoomInput[] },
): Promise<SavePlanResult> {
  const { levelId, expectedVersion, walls, rooms } = params;

  // Zero zaktualizowanych wierszy = ktoś inny zapisał rzut wcześniej — 409, nigdy cichy nadpis.
  const { count } = await tx.level.updateMany({
    where: { id: levelId, version: expectedVersion },
    data: { version: { increment: 1 } },
  });
  if (count === 0) return { status: "conflict" };

  await saveWalls(tx, levelId, walls);
  await saveRooms(tx, levelId, rooms);

  const saved = await tx.level.findUniqueOrThrow({ where: { id: levelId }, include: planInclude });
  return {
    status: "saved",
    plan: {
      version: saved.version,
      walls: saved.walls.map(toWallRecord),
      rooms: saved.rooms.map(toRoomRecord),
    },
  };
}

// deleteMany nieobecnych + upsert reszty — nie "usuń wszystko i wstaw od nowa" (.claude/rules/locations.md).
async function saveWalls(
  tx: Prisma.TransactionClient,
  levelId: string,
  walls: WallInput[],
): Promise<void> {
  const keepIds = walls.map((wall) => wall.id);
  await tx.wall.deleteMany({ where: { levelId, id: { notIn: keepIds } } });

  for (const wall of walls) {
    const data = wallToRowData(wall);
    await tx.wall.upsert({
      where: { id: wall.id },
      create: { id: wall.id, levelId, ...data },
      update: data,
    });
  }
}

async function saveRooms(
  tx: Prisma.TransactionClient,
  levelId: string,
  rooms: RoomInput[],
): Promise<void> {
  const keepIds = rooms.map((room) => room.id);
  await tx.room.deleteMany({ where: { levelId, id: { notIn: keepIds } } });

  for (const room of rooms) {
    await tx.room.upsert({
      where: { id: room.id },
      create: { id: room.id, levelId, name: room.name },
      update: { name: room.name },
    });

    // Wierzchołki nie mają przyszłych kluczy obcych — proste zastąpienie wystarcza.
    await tx.roomVertex.deleteMany({ where: { roomId: room.id } });
    await tx.roomVertex.createMany({
      data: room.vertices.map((vertex, position) => ({
        roomId: room.id,
        xMm: vertex.xMm,
        yMm: vertex.yMm,
        position,
      })),
    });
  }
}
