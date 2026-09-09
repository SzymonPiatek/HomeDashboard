import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma-client.js";

/**
 * Testuje warstwę danych (schemat + Prisma) przeciwko prawdziwej bazie w Dockerze,
 * nie przeciwko atrapie — .claude/rules/data.md. Nie ma jeszcze repozytorium modułu
 * `locations` (backend-dev), więc test woła Prismę wprost, tak jak zrobi to przyszłe
 * repozytorium: pełnym łańcuchem `Wall/Room → Level → Location → Account`.
 */
describe("łańcuch własności Location → Level → Wall/Room", () => {
  let ownerAccountId: string;
  let intruderAccountId: string;
  let locationId: string;
  let levelId: string;
  let wallId: string;
  let roomId: string;

  beforeAll(async () => {
    const owner = await prisma.account.create({
      data: { email: `owner-${randomUUID()}@test.local` },
    });
    const intruder = await prisma.account.create({
      data: { email: `intruder-${randomUUID()}@test.local` },
    });
    ownerAccountId = owner.id;
    intruderAccountId = intruder.id;

    wallId = randomUUID();
    roomId = randomUUID();

    const location = await prisma.location.create({
      data: {
        accountId: ownerAccountId,
        name: "Testowe mieszkanie",
        levels: {
          create: [
            {
              name: "Parter",
              order: 0,
              walls: {
                create: [
                  {
                    id: wallId,
                    p1XMm: 0,
                    p1YMm: 0,
                    p2XMm: 100,
                    p2YMm: 0,
                    p3XMm: 100,
                    p3YMm: 100,
                    p4XMm: 0,
                    p4YMm: 100,
                    heightMm: 2500,
                  },
                ],
              },
              rooms: {
                create: [
                  {
                    id: roomId,
                    name: "Pokój testowy",
                    vertices: {
                      create: [
                        { position: 0, xMm: 0, yMm: 0 },
                        { position: 1, xMm: 100, yMm: 0 },
                        { position: 2, xMm: 100, yMm: 100 },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      include: { levels: true },
    });
    const [level] = location.levels;
    if (!level) throw new Error("expected the created location to have one level");

    locationId = location.id;
    levelId = level.id;
  });

  afterAll(async () => {
    // Kaskada usuwa lokalizację, poziom, ściany, pokoje i wierzchołki.
    await prisma.account.deleteMany({
      where: { id: { in: [ownerAccountId, intruderAccountId] } },
    });
  });

  it("nie zwraca poziomu cudzemu kontu, mimo poprawnego id i locationId", async () => {
    const asOwner = await prisma.level.findFirst({
      where: { id: levelId, locationId, location: { accountId: ownerAccountId } },
    });
    const asIntruder = await prisma.level.findFirst({
      where: { id: levelId, locationId, location: { accountId: intruderAccountId } },
    });

    expect(asOwner?.id).toBe(levelId);
    expect(asIntruder).toBeNull();
  });

  it("nie zwraca ściany ani pokoju cudzemu kontu po samym id", async () => {
    const wallAsIntruder = await prisma.wall.findFirst({
      where: { id: wallId, levelId, level: { location: { accountId: intruderAccountId } } },
    });
    const roomAsIntruder = await prisma.room.findFirst({
      where: { id: roomId, levelId, level: { location: { accountId: intruderAccountId } } },
    });

    expect(wallAsIntruder).toBeNull();
    expect(roomAsIntruder).toBeNull();
  });

  it("kasuje ściany, pokoje i wierzchołki kaskadowo przy usunięciu lokalizacji", async () => {
    const cascadeLocation = await prisma.location.create({
      data: {
        accountId: ownerAccountId,
        name: "Do skasowania",
        levels: {
          create: [
            {
              name: "Parter",
              order: 0,
              walls: {
                create: [
                  {
                    id: randomUUID(),
                    p1XMm: 0,
                    p1YMm: 0,
                    p2XMm: 1,
                    p2YMm: 0,
                    p3XMm: 1,
                    p3YMm: 1,
                    p4XMm: 0,
                    p4YMm: 1,
                    heightMm: 2500,
                  },
                ],
              },
              rooms: {
                create: [
                  {
                    id: randomUUID(),
                    name: "Pokój",
                    vertices: { create: [{ position: 0, xMm: 0, yMm: 0 }] },
                  },
                ],
              },
            },
          ],
        },
      },
      include: { levels: { include: { walls: true, rooms: { include: { vertices: true } } } } },
    });
    const [cascadeLevel] = cascadeLocation.levels;
    if (!cascadeLevel) throw new Error("expected the created location to have one level");
    const [cascadeWall] = cascadeLevel.walls;
    const [cascadeRoom] = cascadeLevel.rooms;
    if (!cascadeWall || !cascadeRoom) throw new Error("expected one wall and one room");
    const [cascadeVertex] = cascadeRoom.vertices;
    if (!cascadeVertex) throw new Error("expected one room vertex");

    await prisma.location.delete({ where: { id: cascadeLocation.id } });

    await expect(prisma.level.findUnique({ where: { id: cascadeLevel.id } })).resolves.toBeNull();
    await expect(prisma.wall.findUnique({ where: { id: cascadeWall.id } })).resolves.toBeNull();
    await expect(prisma.room.findUnique({ where: { id: cascadeRoom.id } })).resolves.toBeNull();
    await expect(
      prisma.roomVertex.findUnique({ where: { id: cascadeVertex.id } }),
    ).resolves.toBeNull();
  });

  it("odrzuca dwa wierzchołki tego samego pokoju na tej samej pozycji", async () => {
    await expect(
      prisma.roomVertex.create({ data: { roomId, position: 0, xMm: 999, yMm: 999 } }),
    ).rejects.toMatchObject<Partial<Prisma.PrismaClientKnownRequestError>>({ code: "P2002" });
  });
});
