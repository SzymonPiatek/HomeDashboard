import type { FloorPlanTestData, Wall } from "./types";

export function getWallLengthMm(wall: Wall): number {
  return Math.hypot(wall.endXMm - wall.startXMm, wall.endYMm - wall.startYMm);
}

// Metry pojawiają się wyłącznie jako sformatowany tekst w UI — dane zostają w mm
// (.claude/rules/floor-plan.md).
export function formatMeters(valueMm: number): string {
  return `${(valueMm / 1000).toFixed(2).replace(".", ",")} m`;
}

export type BoundingBox = {
  minXMm: number;
  minYMm: number;
  maxXMm: number;
  maxYMm: number;
};

// Ramka otaczająca wszystkie ściany i pokoje — potrzebna do viewBox (2D) i kamery (3D),
// żeby oba widoki patrzyły na te same dane z tym samym kadrem.
export function getFloorPlanBoundingBox(data: FloorPlanTestData): BoundingBox {
  const xs: number[] = [];
  const ys: number[] = [];

  for (const wall of data.walls) {
    xs.push(wall.startXMm, wall.endXMm);
    ys.push(wall.startYMm, wall.endYMm);
  }
  for (const room of data.rooms) {
    for (const vertex of room.vertices) {
      xs.push(vertex.xMm);
      ys.push(vertex.yMm);
    }
  }

  return {
    minXMm: Math.min(...xs),
    minYMm: Math.min(...ys),
    maxXMm: Math.max(...xs),
    maxYMm: Math.max(...ys),
  };
}
