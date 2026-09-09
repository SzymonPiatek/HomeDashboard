"use client";

import type { FloorPlanDocument, Point, Room, Wall } from "@repo/contracts/floor-plan";
import { useRef } from "react";

import { translateRoom, translateWall, updateRoom, updateWall } from "../geometry/edit-geometry";
import { toSvgPoint } from "./svg-coordinates";
import type { EditorSelection, EditorTool } from "./types";

type DragState =
  | { kind: "wall"; id: string; start: Point; original: Wall; hasMoved: boolean }
  | { kind: "room"; id: string; start: Point; original: Room; hasMoved: boolean };

type UseShapeDragArgs = {
  draft: FloorPlanDocument;
  setDraft: (updater: (current: FloorPlanDocument) => FloorPlanDocument) => void;
  onDragStart: () => void;
  tool: EditorTool;
  setSelection: (target: EditorSelection) => void;
};

export function useShapeDrag({
  draft,
  setDraft,
  onDragStart,
  tool,
  setSelection,
}: UseShapeDragArgs) {
  const dragRef = useRef<DragState | null>(null);

  function beginDrag(target: EditorSelection, point: Point) {
    if (!target) return;
    setSelection(target);
    if (target.type === "wall") {
      const original = draft.walls.find((wall) => wall.id === target.id);
      if (original) {
        dragRef.current = { kind: "wall", id: target.id, start: point, original, hasMoved: false };
      }
      return;
    }
    const original = draft.rooms.find((room) => room.id === target.id);
    if (original) {
      dragRef.current = { kind: "room", id: target.id, start: point, original, hasMoved: false };
    }
  }

  function handleShapePointerDown(
    event: React.PointerEvent<SVGPolygonElement>,
    target: EditorSelection,
  ) {
    if (tool !== "select" || !target) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    event.stopPropagation();
    beginDrag(target, toSvgPoint(svg, event));
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function applyDrag(point: Point) {
    const drag = dragRef.current;
    if (!drag) return;
    const dxMm = point.xMm - drag.start.xMm;
    const dyMm = point.yMm - drag.start.yMm;
    if (dxMm === 0 && dyMm === 0) return;
    if (!drag.hasMoved) {
      drag.hasMoved = true;
      onDragStart();
    }
    if (drag.kind === "wall") {
      setDraft((current) =>
        updateWall(current, drag.id, (wall) => translateWall(wall, dxMm, dyMm)),
      );
      return;
    }
    setDraft((current) => updateRoom(current, drag.id, (room) => translateRoom(room, dxMm, dyMm)));
  }

  function handlePointerMove(point: Point): boolean {
    if (!dragRef.current) return false;
    applyDrag(point);
    return true;
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  return { handleShapePointerDown, handlePointerMove, handlePointerUp };
}
