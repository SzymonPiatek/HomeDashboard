import { formatMeters, getFloorPlanBoundingBox, getWallBoundingSizeMm } from "./geometry";
import type { FloorPlanTestData, Point, Wall } from "./types";

// Margines wokół rzutu w viewBox, w tych samych mm co dane — ADR-0006.
const VIEW_PADDING_MM = 400;

type FloorPlanView2DProps = {
  data: FloorPlanTestData;
};

function toPolygonPoints(points: readonly Point[]): string {
  return points.map((point) => `${point.xMm},${point.yMm}`).join(" ");
}

// SVG, 1 jednostka = 1 mm (ADR-0006). Kolory wyłącznie przez currentColor + token motywu.
export function FloorPlanView2D({ data }: FloorPlanView2DProps) {
  const box = getFloorPlanBoundingBox(data);
  const viewBox = [
    box.minXMm - VIEW_PADDING_MM,
    box.minYMm - VIEW_PADDING_MM,
    box.maxXMm - box.minXMm + VIEW_PADDING_MM * 2,
    box.maxYMm - box.minYMm + VIEW_PADDING_MM * 2,
  ].join(" ");

  return (
    <svg viewBox={viewBox} aria-label="Rzut mieszkania, widok z góry" className="w-full flex-1">
      {data.rooms.map((room) => (
        <polygon
          key={room.id}
          aria-hidden="true"
          points={toPolygonPoints(room.vertices)}
          fill="currentColor"
          className="text-muted/70"
        />
      ))}
      {data.walls.map((wall, index) => (
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
