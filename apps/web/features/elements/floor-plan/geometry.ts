import type { FloorPlanTestData, Wall } from "./types";

// Metry pojawiają się wyłącznie jako sformatowany tekst w UI — dane zostają w mm
// (.claude/rules/floor-plan.md).
export function formatMeters(valueMm: number): string {
  return `${(valueMm / 1000).toFixed(2).replace(".", ",")} m`;
}

// Rozmiar prostokąta ściany z jego czterech rogów — wyłącznie do etykiety
// dostępności. Rysowanie używa punktów wprost (FloorPlanView2D, three/scene.ts),
// to nie jest formuła, z której wyliczamy kształt.
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

// Ramka otaczająca wszystkie ściany i pokoje — potrzebna do viewBox (2D) i kamery (3D),
// żeby oba widoki patrzyły na te same dane z tym samym kadrem.
export function getFloorPlanBoundingBox(data: FloorPlanTestData): BoundingBox {
  const xs: number[] = [];
  const ys: number[] = [];

  for (const wall of data.walls) {
    for (const point of wall.points) {
      xs.push(point.xMm);
      ys.push(point.yMm);
    }
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
