import type { FloorPlanDocument, Wall } from "@repo/contracts/floor-plan";
import { describe, expect, it } from "vitest";

import { formatMeters, getFloorPlanBoundingBox, getWallBoundingSizeMm } from "./geometry";

const WALL: Wall = {
  id: "3f9a1c10-1111-4a11-8a11-000000000001",
  points: [
    { xMm: 0, yMm: 0 },
    { xMm: 4000, yMm: 0 },
    { xMm: 4000, yMm: 200 },
    { xMm: 0, yMm: 200 },
  ],
  heightMm: 2500,
};

const DOCUMENT: FloorPlanDocument = {
  version: 1,
  walls: [WALL],
  rooms: [
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a01",
      name: "Salon",
      vertices: [
        { xMm: 200, yMm: 200 },
        { xMm: 3800, yMm: 200 },
        { xMm: 3800, yMm: 3000 },
        { xMm: 200, yMm: 3000 },
      ],
    },
  ],
};

const EMPTY_DOCUMENT: FloorPlanDocument = { version: 0, walls: [], rooms: [] };

describe("formatMeters", () => {
  it("formatuje milimetry jako metry z przecinkiem dziesiętnym", () => {
    expect(formatMeters(4000)).toBe("4,00 m");
    expect(formatMeters(1250)).toBe("1,25 m");
  });
});

describe("getWallBoundingSizeMm", () => {
  it("liczy szerokość i głębokość prostokąta ściany", () => {
    expect(getWallBoundingSizeMm(WALL)).toEqual({ widthMm: 4000, depthMm: 200 });
  });
});

describe("getFloorPlanBoundingBox", () => {
  it("obejmuje ściany i pokoje dokumentu", () => {
    expect(getFloorPlanBoundingBox(DOCUMENT)).toEqual({
      minXMm: 0,
      minYMm: 0,
      maxXMm: 4000,
      maxYMm: 3000,
    });
  });

  it("zwraca zerowy prostokąt dla pustego dokumentu zamiast NaN/Infinity", () => {
    expect(getFloorPlanBoundingBox(EMPTY_DOCUMENT)).toEqual({
      minXMm: 0,
      minYMm: 0,
      maxXMm: 0,
      maxYMm: 0,
    });
  });
});
