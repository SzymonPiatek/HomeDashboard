import type { FloorPlanDocument, Point } from "@repo/contracts/floor-plan";

import { distanceMm, snapPointToGrid, snapWallAngle } from "./edit-geometry";

function collectWallVertices(document: FloorPlanDocument): Point[] {
  const vertices: Point[] = [];
  for (const wall of document.walls) {
    vertices.push(...wall.points);
  }
  return vertices;
}

function findNearestPoint(point: Point, candidates: Point[]): Point | null {
  let closest: Point | null = null;
  let closestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = distanceMm(point, candidate);
    if (distance < closestDistance) {
      closest = candidate;
      closestDistance = distance;
    }
  }
  return closest;
}

function isAxisAlignedAngle(from: Point, to: Point): boolean {
  const dx = to.xMm - from.xMm;
  const dy = to.yMm - from.yMm;
  return (dx !== 0 || dy !== 0) && (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy));
}

// Wierzchołek pokoju leży na rogu istniejącej ściany, chyba że odcinek od
// poprzedniego wierzchołka zachowuje kąt będący wielokrotnością 45° — wtedy
// wolno postawić punkt poza ścianą (BL-020, hardkodowane na start).
export function snapRoomVertex(
  previousVertex: Point | null,
  point: Point,
  document: FloorPlanDocument,
): Point {
  const nearestWallVertex = findNearestPoint(point, collectWallVertices(document));

  if (!previousVertex) {
    return nearestWallVertex ?? snapPointToGrid(point);
  }
  if (nearestWallVertex && isAxisAlignedAngle(previousVertex, nearestWallVertex)) {
    return nearestWallVertex;
  }
  return snapWallAngle(previousVertex, point);
}
