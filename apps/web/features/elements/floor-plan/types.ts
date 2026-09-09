export type Point = {
  xMm: number;
  yMm: number;
};

// Kształt pól zgodny z ADR-0002 — spike bez API/kontraktu, definicja lokalna
// (docelowo te typy pochodzą z @repo/contracts, wyprowadzone z zod).
export type Wall = {
  id: string;
  startXMm: number;
  startYMm: number;
  endXMm: number;
  endYMm: number;
  thicknessMm: number;
  heightMm: number;
};

export type Room = {
  id: string;
  name: string;
  vertices: Point[];
};

export type FloorPlanTestData = {
  walls: Wall[];
  rooms: Room[];
};
