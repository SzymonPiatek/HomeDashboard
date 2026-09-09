import { formatMeters, getFloorPlanBoundingBox, getWallLengthMm } from "./geometry";
import type { FloorPlanTestData, Wall } from "./types";

// Margines wokół rzutu w viewBox, w tych samych mm co dane — ADR-0006.
const VIEW_PADDING_MM = 400;
// Niewidoczna ścieżka pod ścianą, żeby obszar trafienia nie schodził poniżej celu
// dotykowego nawet przy cienkiej ścianie — .claude/rules/floor-plan.md.
const MIN_HIT_WIDTH_MM = 400;

type FloorPlanView2DProps = {
  data: FloorPlanTestData;
};

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
          points={room.vertices.map((vertex) => `${vertex.xMm},${vertex.yMm}`).join(" ")}
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
  const lengthLabel = formatMeters(getWallLengthMm(wall));
  const hitWidthMm = Math.max(wall.thicknessMm, MIN_HIT_WIDTH_MM);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Ściana ${index + 1}, długość ${lengthLabel}`}
      className="text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <line
        x1={wall.startXMm}
        y1={wall.startYMm}
        x2={wall.endXMm}
        y2={wall.endYMm}
        stroke="transparent"
        strokeWidth={hitWidthMm}
        pointerEvents="stroke"
      />
      <line
        x1={wall.startXMm}
        y1={wall.startYMm}
        x2={wall.endXMm}
        y2={wall.endYMm}
        stroke="currentColor"
        strokeWidth={wall.thicknessMm}
        strokeLinecap="square"
      />
    </g>
  );
}
