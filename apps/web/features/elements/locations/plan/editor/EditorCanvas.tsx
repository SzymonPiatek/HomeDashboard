"use client";

import type { FloorPlanDocument, Point, Room, Wall } from "@repo/contracts/floor-plan";
import { useRef } from "react";

import { buildWallCornersFromCenterline } from "../geometry/edit-geometry";
import { formatMeters, getFloorPlanBoundingBox, getWallBoundingSizeMm } from "../geometry/geometry";
import { toSvgPoint } from "./svg-coordinates";
import type { EditorSelection, EditorTool } from "./types";

const VIEW_PADDING_MM = 400;
const MIN_VIEW_SIZE_MM = 2000;
const DRAFT_THICKNESS_MM = 200;
const ROOM_PREVIEW_STROKE_MM = 20;

function toPolygonPoints(points: readonly Point[]): string {
  return points.map((point) => `${point.xMm},${point.yMm}`).join(" ");
}

type ShapeHandlers = {
  onPointerDown: (event: React.PointerEvent<SVGPolygonElement>, target: EditorSelection) => void;
  onKeyDown: (event: React.KeyboardEvent<SVGPolygonElement>, target: EditorSelection) => void;
  onFocus: (target: EditorSelection) => void;
};

function EditableWall({
  wall,
  index,
  isSelected,
  handlers,
}: {
  wall: Wall;
  index: number;
  isSelected: boolean;
  handlers: ShapeHandlers;
}) {
  const { widthMm, depthMm } = getWallBoundingSizeMm(wall);
  const label = `Ściana ${index + 1}, ${formatMeters(widthMm)} × ${formatMeters(depthMm)}`;
  const target: EditorSelection = { type: "wall", id: wall.id };

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
      onPointerDown={(event) => handlers.onPointerDown(event, target)}
      onKeyDown={(event) => handlers.onKeyDown(event, target)}
      onFocus={() => handlers.onFocus(target)}
    />
  );
}

function EditableRoom({
  room,
  isSelected,
  handlers,
}: {
  room: Room;
  isSelected: boolean;
  handlers: ShapeHandlers;
}) {
  const target: EditorSelection = { type: "room", id: room.id };

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
      onPointerDown={(event) => handlers.onPointerDown(event, target)}
      onKeyDown={(event) => handlers.onKeyDown(event, target)}
      onFocus={() => handlers.onFocus(target)}
    />
  );
}

type EditorCanvasProps = {
  document: FloorPlanDocument;
  tool: EditorTool;
  selection: EditorSelection;
  wallDraftStart: Point | null;
  roomDraftVertices: Point[];
  cursorPoint: Point | null;
  onPointerDown: (event: React.PointerEvent<SVGSVGElement>, point: Point) => void;
  onPointerMove: (point: Point) => void;
  onPointerUp: () => void;
  shapeHandlers: ShapeHandlers;
};

export function EditorCanvas({
  document,
  tool,
  selection,
  wallDraftStart,
  roomDraftVertices,
  cursorPoint,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  shapeHandlers,
}: EditorCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const box = getFloorPlanBoundingBox(document);
  const width = Math.max(box.maxXMm - box.minXMm, MIN_VIEW_SIZE_MM) + VIEW_PADDING_MM * 2;
  const height = Math.max(box.maxYMm - box.minYMm, MIN_VIEW_SIZE_MM) + VIEW_PADDING_MM * 2;
  const viewBox = [box.minXMm - VIEW_PADDING_MM, box.minYMm - VIEW_PADDING_MM, width, height].join(
    " ",
  );

  const wallPreview =
    tool === "wall" && wallDraftStart && cursorPoint
      ? buildWallCornersFromCenterline(wallDraftStart, cursorPoint, DRAFT_THICKNESS_MM)
      : null;
  const roomPreview =
    tool === "room" && roomDraftVertices.length > 0
      ? [...roomDraftVertices, ...(cursorPoint ? [cursorPoint] : [])]
      : null;

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    onPointerDown(event, toSvgPoint(svgRef.current, event));
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    onPointerMove(toSvgPoint(svgRef.current, event));
  }

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      aria-label="Rzut poziomu, widok z góry — edytor"
      className={tool === "select" ? "w-full flex-1" : "w-full flex-1 cursor-crosshair"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={onPointerUp}
    >
      {document.rooms.map((room) => (
        <EditableRoom
          key={room.id}
          room={room}
          isSelected={selection?.type === "room" && selection.id === room.id}
          handlers={shapeHandlers}
        />
      ))}
      {document.walls.map((wall, index) => (
        <EditableWall
          key={wall.id}
          wall={wall}
          index={index}
          isSelected={selection?.type === "wall" && selection.id === wall.id}
          handlers={shapeHandlers}
        />
      ))}
      {wallPreview ? (
        <polygon
          aria-hidden="true"
          points={toPolygonPoints(wallPreview)}
          className="fill-primary/40"
        />
      ) : null}
      {roomPreview ? (
        <polyline
          aria-hidden="true"
          points={toPolygonPoints(roomPreview)}
          strokeWidth={ROOM_PREVIEW_STROKE_MM}
          className="fill-none stroke-primary"
        />
      ) : null}
    </svg>
  );
}
