import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma-client.js";

/**
 * Rzut z SP-005 (`apps/web/features/elements/floor-plan/test-data.ts`), przeniesiony
 * tu jako jednorazowa fikstura — bez niego gałąź SP-007 wygląda na pustą, bo edytor
 * rzutu jeszcze nie istnieje (BL-020).
 */
const ROOMS = [
  {
    name: "Hol",
    points: [
      [200, 200],
      [1400, 200],
      [1400, 5700],
      [200, 5700],
    ],
  },
  {
    name: "Łazienka",
    points: [
      [1500, 200],
      [3500, 200],
      [3500, 2700],
      [1500, 2700],
    ],
  },
  {
    name: "Sypialnia",
    points: [
      [3600, 200],
      [8400, 200],
      [8400, 2700],
      [3600, 2700],
    ],
  },
  {
    name: "Salon z kuchnią",
    points: [
      [1500, 2800],
      [7500, 2800],
      [7500, 5700],
      [1500, 5700],
    ],
  },
] as const;

type Point = readonly [number, number];
type WallCorners = readonly [Point, Point, Point, Point];

const WALLS: readonly WallCorners[] = [
  [
    [0, 0],
    [8600, 0],
    [8600, 200],
    [0, 200],
  ],
  [
    [0, 0],
    [200, 0],
    [200, 5900],
    [0, 5900],
  ],
  [
    [0, 5700],
    [7700, 5700],
    [7700, 5900],
    [0, 5900],
  ],
  [
    [8400, 0],
    [8600, 0],
    [8600, 2900],
    [8400, 2900],
  ],
  [
    [7500, 2700],
    [7700, 2700],
    [7700, 5900],
    [7500, 5900],
  ],
  [
    [7700, 2700],
    [8600, 2700],
    [8600, 2900],
    [7700, 2900],
  ],
  [
    [1400, 0],
    [1500, 0],
    [1500, 5900],
    [1400, 5900],
  ],
  [
    [3500, 200],
    [3600, 200],
    [3600, 2700],
    [3500, 2700],
  ],
  [
    [1500, 2700],
    [7500, 2700],
    [7500, 2800],
    [1500, 2800],
  ],
];

const WALL_HEIGHT_MM = 2500;

async function main(): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) throw new Error("OWNER_EMAIL is required to seed the owner account");

  const account = await prisma.account.upsert({
    where: { email: ownerEmail },
    create: { email: ownerEmail },
    update: {},
  });

  const existing = await prisma.location.findFirst({
    where: { accountId: account.id, name: "Mieszkanie" },
  });
  if (existing) {
    console.log("Seed skipped: 'Mieszkanie' already exists for the owner account.");
    return;
  }

  await prisma.location.create({
    data: {
      accountId: account.id,
      name: "Mieszkanie",
      levels: {
        create: [
          {
            name: "Parter",
            order: 0,
            walls: { create: WALLS.map(toWallCreateInput) },
            rooms: { create: ROOMS.map(toRoomCreateInput) },
          },
        ],
      },
    },
  });

  console.log("Seed done: 'Mieszkanie' / 'Parter' created for the owner account.");
}

function toWallCreateInput(points: WallCorners) {
  const [p1, p2, p3, p4] = points;
  return {
    id: randomUUID(),
    p1XMm: p1[0],
    p1YMm: p1[1],
    p2XMm: p2[0],
    p2YMm: p2[1],
    p3XMm: p3[0],
    p3YMm: p3[1],
    p4XMm: p4[0],
    p4YMm: p4[1],
    heightMm: WALL_HEIGHT_MM,
  };
}

function toRoomCreateInput(room: (typeof ROOMS)[number]) {
  return {
    id: randomUUID(),
    name: room.name,
    vertices: {
      create: room.points.map(([xMm, yMm], position) => ({ position, xMm, yMm })),
    },
  };
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
