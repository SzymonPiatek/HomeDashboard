"use client";

import type { FloorPlanDocument, Point, Room, Wall } from "@repo/contracts/floor-plan";
import { useState } from "react";

import { formatMeters, getFloorPlanBoundingBox, getWallBoundingSizeMm } from "./geometry/geometry";

const VIEW_PADDING_MM = 400;
// Zapewnia widoczną siatkę nawet dla pustego dokumentu (US-2) zamiast zerowego viewBox.
const MIN_VIEW_SIZE_MM = 2000;

type Selection = { type: "wall" | "room"; id: string } | null;

type StaticFloorPlanViewProps = {
  document: FloorPlanDocument;
};

function toPolygonPoints(points: readonly Point[]): string {
  return points.map((point) => `${point.xMm},${point.yMm}`).join(" ");
}

// Widok poza trybem edycji — zaznaczanie (klik, Tab) działa zawsze, bo jest czysto
// wizualne; rysowanie, przeciąganie i zapis żyją w FloorPlanEditor (tryb edycji).
export function StaticFloorPlanView({ document }: StaticFloorPlanViewProps) {
  const [selection, setSelection] = useState<Selection>(null);
  const box = getFloorPlanBoundingBox(document);
  const width = Math.max(box.maxXMm - box.minXMm, MIN_VIEW_SIZE_MM) + VIEW_PADDING_MM * 2;
  const height = Math.max(box.maxYMm - box.minYMm, MIN_VIEW_SIZE_MM) + VIEW_PADDING_MM * 2;
  const viewBox = [box.minXMm - VIEW_PADDING_MM, box.minYMm - VIEW_PADDING_MM, width, height].join(
    " ",
  );

  return (
    <svg
      viewBox={viewBox}
      aria-label="Rzut poziomu, widok z góry"
      className="w-full flex-1"
      onClick={(event) => {
        if (event.target === event.currentTarget) setSelection(null);
      }}
    >
      {document.rooms.map((room) => (
        <RoomShape
          key={room.id}
          room={room}
          isSelected={selection?.type === "room" && selection.id === room.id}
          onSelect={() => setSelection({ type: "room", id: room.id })}
        />
      ))}
      {document.walls.map((wall, index) => (
        <WallShape
          key={wall.id}
          wall={wall}
          index={index}
          isSelected={selection?.type === "wall" && selection.id === wall.id}
          onSelect={() => setSelection({ type: "wall", id: wall.id })}
        />
      ))}
    </svg>
  );
}

function WallShape({
  wall,
  index,
  isSelected,
  onSelect,
}: {
  wall: Wall;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { widthMm, depthMm } = getWallBoundingSizeMm(wall);
  const label = `Ściana ${index + 1}, ${formatMeters(widthMm)} × ${formatMeters(depthMm)}`;

  return (
    <polygon
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={isSelected}
      points={toPolygonPoints(wall.points)}
      fill="currentColor"
      className={
        isSelected
          ? "text-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          : "text-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      }
      onClick={onSelect}
      onFocus={onSelect}
    />
  );
}

function RoomShape({
  room,
  isSelected,
  onSelect,
}: {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <polygon
      role="button"
      tabIndex={0}
      aria-label={`Pokój „${room.name}”`}
      aria-pressed={isSelected}
      points={toPolygonPoints(room.vertices)}
      fill="currentColor"
      className={
        isSelected
          ? "text-primary/40 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          : "text-muted/70 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      }
      onClick={onSelect}
      onFocus={onSelect}
    />
  );
}
