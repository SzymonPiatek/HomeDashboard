import type { FloorPlanDocument, Wall } from "@repo/contracts/floor-plan";

export function formatMeters(valueMm: number): string {
  return `${(valueMm / 1000).toFixed(2).replace(".", ",")} m`;
}

export function getWallBoundingSizeMm(wall: Wall): { widthMm: number; depthMm: number } {
  const xs = wall.points.map((point) => point.xMm);
  const ys = wall.points.map((point) => point.yMm);

  return {
    widthMm: Math.max(...xs) - Math.min(...xs),
    depthMm: Math.max(...ys) - Math.min(...ys),
  };
}

export type BoundingBox = {
  minXMm: number;
  minYMm: number;
  maxXMm: number;
  maxYMm: number;
};

const EMPTY_BOUNDING_BOX: BoundingBox = { minXMm: 0, minYMm: 0, maxXMm: 0, maxYMm: 0 };

export function getFloorPlanBoundingBox(document: FloorPlanDocument): BoundingBox {
  const xs: number[] = [];
  const ys: number[] = [];

  for (const wall of document.walls) {
    for (const point of wall.points) {
      xs.push(point.xMm);
      ys.push(point.yMm);
    }
  }
  for (const room of document.rooms) {
    for (const vertex of room.vertices) {
      xs.push(vertex.xMm);
      ys.push(vertex.yMm);
    }
  }

  // Rzut bez zapisanej geometrii (US-2) jest stanem poprawnym — pusta siatka
  // wokół (0,0), nie błąd wyliczenia min/max z pustej tablicy.
  if (xs.length === 0) return EMPTY_BOUNDING_BOX;

  return {
    minXMm: Math.min(...xs),
    minYMm: Math.min(...ys),
    maxXMm: Math.max(...xs),
    maxYMm: Math.max(...ys),
  };
}
