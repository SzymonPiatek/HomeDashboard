export type Point = {
  xMm: number;
  yMm: number;
};

export const DEFAULT_WALL_HEIGHT_MM = 2500;

export type Wall = {
  id: string;
  points: [Point, Point, Point, Point];
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
