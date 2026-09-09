"use client";

import type { FloorPlanDocument, Point } from "@repo/contracts/floor-plan";
import { DEFAULT_WALL_THICKNESS_MM, SNAP_GRID_MM } from "@repo/contracts/floor-plan";
import { useState } from "react";

import { usePutFloorPlan } from "../../api/use-floor-plan";
import {
  addRoom,
  addWall,
  createRoom,
  createWall,
  removeRoom,
  removeWall,
  translateRoom,
  translateWall,
  updateRoom,
  updateWall,
} from "../geometry/edit-geometry";
import type { EditorSelection, EditorTool } from "./types";
import { useDraftDrawing } from "./use-draft-drawing";
import { useShapeDrag } from "./use-shape-drag";

const ARROW_DELTA: Record<string, [number, number]> = {
  ArrowUp: [0, -SNAP_GRID_MM],
  ArrowDown: [0, SNAP_GRID_MM],
  ArrowLeft: [-SNAP_GRID_MM, 0],
  ArrowRight: [SNAP_GRID_MM, 0],
};

export function useFloorPlanEditor(
  locationId: string,
  levelId: string,
  initial: FloorPlanDocument,
) {
  const [draft, setDraft] = useState(initial);
  const [history, setHistory] = useState<FloorPlanDocument[]>([]);
  const [future, setFuture] = useState<FloorPlanDocument[]>([]);
  const [tool, setTool] = useState<EditorTool>("select");
  const [selection, setSelection] = useState<EditorSelection>(null);
  const putFloorPlan = usePutFloorPlan(locationId, levelId);

  function pushHistorySnapshot() {
    setHistory((current) => [...current, draft]);
    setFuture([]);
  }

  function commitDraft(updater: (current: FloorPlanDocument) => FloorPlanDocument) {
    pushHistorySnapshot();
    setDraft(updater(draft));
  }

  const shapeDrag = useShapeDrag({
    draft,
    setDraft,
    onDragStart: pushHistorySnapshot,
    tool,
    setSelection,
  });

  const drawing = useDraftDrawing({
    tool,
    onWallReady: (start, end) => {
      const wall = createWall(start, end, DEFAULT_WALL_THICKNESS_MM);
      commitDraft((current) => addWall(current, wall));
    },
    onRoomReady: (vertices, name) => {
      commitDraft((current) => addRoom(current, createRoom(vertices, name)));
    },
  });

  function handleToolChange(nextTool: EditorTool) {
    setTool(nextTool);
    setSelection(null);
    drawing.resetDrafts();
  }

  function handleCanvasPointerDown(event: React.PointerEvent<SVGSVGElement>, point: Point) {
    if (tool === "select" && event.target === event.currentTarget) {
      setSelection(null);
      return;
    }
    drawing.handlePointerDown(point);
  }

  function handleCanvasPointerMove(point: Point) {
    const handledByDrag = shapeDrag.handlePointerMove(point);
    if (!handledByDrag && (tool === "wall" || tool === "room")) {
      drawing.setCursorPoint(point);
    }
  }

  function handleDeleteSelection(target: EditorSelection) {
    if (!target) return;
    commitDraft((current) =>
      target.type === "wall" ? removeWall(current, target.id) : removeRoom(current, target.id),
    );
    setSelection(null);
  }

  function handleNudge(target: EditorSelection, dxMm: number, dyMm: number) {
    if (!target) return;
    commitDraft((current) =>
      target.type === "wall"
        ? updateWall(current, target.id, (wall) => translateWall(wall, dxMm, dyMm))
        : updateRoom(current, target.id, (room) => translateRoom(room, dxMm, dyMm)),
    );
  }

  function handleShapeKeyDown(
    event: React.KeyboardEvent<SVGPolygonElement>,
    target: EditorSelection,
  ) {
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      handleDeleteSelection(target);
      return;
    }
    const delta = ARROW_DELTA[event.key];
    if (!delta) return;
    event.preventDefault();
    handleNudge(target, delta[0], delta[1]);
  }

  function handleUndo() {
    const previous = history.at(-1);
    if (previous === undefined) return;
    setHistory((current) => current.slice(0, -1));
    setFuture((current) => [...current, draft]);
    setDraft(previous);
    setSelection(null);
  }

  function handleRedo() {
    const next = future.at(-1);
    if (next === undefined) return;
    setFuture((current) => current.slice(0, -1));
    setHistory((current) => [...current, draft]);
    setDraft(next);
    setSelection(null);
  }

  function handleSave() {
    putFloorPlan.mutate(draft, {
      onSuccess: (saved) => {
        setDraft(saved);
        setHistory([]);
        setFuture([]);
      },
    });
  }

  return {
    draft,
    tool,
    selection,
    wallDraftStart: drawing.wallDraftStart,
    roomDraftVertices: drawing.roomDraftVertices,
    pendingRoomVertices: drawing.pendingRoomVertices,
    cursorPoint: drawing.cursorPoint,
    isDirty: draft !== initial,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    isSaving: putFloorPlan.isPending,
    saveError: putFloorPlan.error?.message ?? null,
    handleToolChange,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp: shapeDrag.handlePointerUp,
    handleShapePointerDown: shapeDrag.handleShapePointerDown,
    handleShapeKeyDown,
    handleShapeFocus: setSelection,
    handleUndo,
    handleRedo,
    handleRoomNameConfirm: drawing.confirmRoomName,
    handleRoomNameCancel: drawing.cancelRoomName,
    handleSave,
  };
}
