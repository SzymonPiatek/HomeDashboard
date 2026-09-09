import type { Point, RoomRecord, WallInput, WallRecord } from "./locations.types.js";

/** Ściana w bazie: osiem kolumn Int, nie tablica punktów — ADR-0010. */
export type WallRow = {
  id: string;
  p1XMm: number;
  p1YMm: number;
  p2XMm: number;
  p2YMm: number;
  p3XMm: number;
  p3YMm: number;
  p4XMm: number;
  p4YMm: number;
  heightMm: number;
};

export type RoomRow = {
  id: string;
  name: string;
  vertices: { xMm: number; yMm: number }[];
};

export function toWallRecord(row: WallRow): WallRecord {
  return {
    id: row.id,
    points: [
      { xMm: row.p1XMm, yMm: row.p1YMm },
      { xMm: row.p2XMm, yMm: row.p2YMm },
      { xMm: row.p3XMm, yMm: row.p3YMm },
      { xMm: row.p4XMm, yMm: row.p4YMm },
    ],
    heightMm: row.heightMm,
  };
}

export function wallToRowData(wall: WallInput): Omit<WallRow, "id"> {
  const [p1, p2, p3, p4] = wall.points;
  return {
    p1XMm: p1.xMm,
    p1YMm: p1.yMm,
    p2XMm: p2.xMm,
    p2YMm: p2.yMm,
    p3XMm: p3.xMm,
    p3YMm: p3.yMm,
    p4XMm: p4.xMm,
    p4YMm: p4.yMm,
    heightMm: wall.heightMm,
  };
}

export function toRoomRecord(row: RoomRow): RoomRecord {
  return { id: row.id, name: row.name, vertices: row.vertices.map(toPoint) };
}

function toPoint(vertex: { xMm: number; yMm: number }): Point {
  return { xMm: vertex.xMm, yMm: vertex.yMm };
}
