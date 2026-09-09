import type { FloorPlanDocument, Point, Wall } from "@repo/contracts/floor-plan";

import { formatMeters, getFloorPlanBoundingBox, getWallBoundingSizeMm } from "./geometry/geometry";

const VIEW_PADDING_MM = 400;
// Zapewnia widoczną siatkę nawet dla pustego dokumentu (US-2) zamiast zerowego viewBox.
const MIN_VIEW_SIZE_MM = 2000;

type FloorPlanView2DProps = {
  document: FloorPlanDocument;
};

function toPolygonPoints(points: readonly Point[]): string {
  return points.map((point) => `${point.xMm},${point.yMm}`).join(" ");
}

export function FloorPlanView2D({ document }: FloorPlanView2DProps) {
  const box = getFloorPlanBoundingBox(document);
  const width = Math.max(box.maxXMm - box.minXMm, MIN_VIEW_SIZE_MM) + VIEW_PADDING_MM * 2;
  const height = Math.max(box.maxYMm - box.minYMm, MIN_VIEW_SIZE_MM) + VIEW_PADDING_MM * 2;
  const viewBox = [box.minXMm - VIEW_PADDING_MM, box.minYMm - VIEW_PADDING_MM, width, height].join(
    " ",
  );

  return (
    <svg viewBox={viewBox} aria-label="Rzut poziomu, widok z góry" className="w-full flex-1">
      {document.rooms.map((room) => (
        <polygon
          key={room.id}
          aria-hidden="true"
          points={toPolygonPoints(room.vertices)}
          fill="currentColor"
          className="text-muted/70"
        />
      ))}
      {document.walls.map((wall, index) => (
        <WallShape key={wall.id} wall={wall} index={index} />
      ))}
    </svg>
  );
}

function WallShape({ wall, index }: { wall: Wall; index: number }) {
  const { widthMm, depthMm } = getWallBoundingSizeMm(wall);
  const label = `Ściana ${index + 1}, ${formatMeters(widthMm)} × ${formatMeters(depthMm)}`;

  return (
    <polygon
      role="button"
      tabIndex={0}
      aria-label={label}
      points={toPolygonPoints(wall.points)}
      fill="currentColor"
      className="text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    />
  );
}
