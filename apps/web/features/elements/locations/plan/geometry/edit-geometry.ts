import type { FloorPlanDocument, Point, Room, Wall } from "@repo/contracts/floor-plan";
import { DEFAULT_WALL_HEIGHT_MM, SNAP_GRID_MM } from "@repo/contracts/floor-plan";

export function snapToGrid(valueMm: number, stepMm: number = SNAP_GRID_MM): number {
  return Math.round(valueMm / stepMm) * stepMm;
}

export function snapPointToGrid(point: Point): Point {
  return { xMm: snapToGrid(point.xMm), yMm: snapToGrid(point.yMm) };
}

export function distanceMm(a: Point, b: Point): number {
  return Math.hypot(b.xMm - a.xMm, b.yMm - a.yMm);
}

// Zapisywane są tylko cztery rogi (ADR-0010) — grubość istnieje wyłącznie tu,
// w trakcie budowania prostokąta z odcinka osi.
export function buildWallCornersFromCenterline(
  start: Point,
  end: Point,
  thicknessMm: number,
): [Point, Point, Point, Point] {
  const dx = end.xMm - start.xMm;
  const dy = end.yMm - start.yMm;
  const length = Math.hypot(dx, dy) || 1;
  const halfThickness = thicknessMm / 2;
  const normalX = (-dy / length) * halfThickness;
  const normalY = (dx / length) * halfThickness;

  return [
    { xMm: Math.round(start.xMm + normalX), yMm: Math.round(start.yMm + normalY) },
    { xMm: Math.round(end.xMm + normalX), yMm: Math.round(end.yMm + normalY) },
    { xMm: Math.round(end.xMm - normalX), yMm: Math.round(end.yMm - normalY) },
    { xMm: Math.round(start.xMm - normalX), yMm: Math.round(start.yMm - normalY) },
  ];
}

export function createWall(start: Point, end: Point, thicknessMm: number): Wall {
  return {
    id: crypto.randomUUID(),
    points: buildWallCornersFromCenterline(start, end, thicknessMm),
    heightMm: DEFAULT_WALL_HEIGHT_MM,
  };
}

export function createRoom(vertices: Point[], name: string): Room {
  return { id: crypto.randomUUID(), name, vertices };
}

export function translateWall(wall: Wall, dxMm: number, dyMm: number): Wall {
  const [p1, p2, p3, p4] = wall.points;
  const shift = (point: Point) => ({ xMm: point.xMm + dxMm, yMm: point.yMm + dyMm });
  return { ...wall, points: [shift(p1), shift(p2), shift(p3), shift(p4)] };
}

export function translateRoom(room: Room, dxMm: number, dyMm: number): Room {
  return {
    ...room,
    vertices: room.vertices.map((vertex) => ({ xMm: vertex.xMm + dxMm, yMm: vertex.yMm + dyMm })),
  };
}

export function addWall(document: FloorPlanDocument, wall: Wall): FloorPlanDocument {
  return { ...document, walls: [...document.walls, wall] };
}

export function removeWall(document: FloorPlanDocument, wallId: string): FloorPlanDocument {
  return { ...document, walls: document.walls.filter((wall) => wall.id !== wallId) };
}

export function updateWall(
  document: FloorPlanDocument,
  wallId: string,
  updater: (wall: Wall) => Wall,
): FloorPlanDocument {
  return {
    ...document,
    walls: document.walls.map((wall) => (wall.id === wallId ? updater(wall) : wall)),
  };
}

export function addRoom(document: FloorPlanDocument, room: Room): FloorPlanDocument {
  return { ...document, rooms: [...document.rooms, room] };
}

export function removeRoom(document: FloorPlanDocument, roomId: string): FloorPlanDocument {
  return { ...document, rooms: document.rooms.filter((room) => room.id !== roomId) };
}

export function updateRoom(
  document: FloorPlanDocument,
  roomId: string,
  updater: (room: Room) => Room,
): FloorPlanDocument {
  return {
    ...document,
    rooms: document.rooms.map((room) => (room.id === roomId ? updater(room) : room)),
  };
}
