"use client";

import type { Point } from "@repo/contracts/floor-plan";
import { MIN_WALL_LENGTH_MM, SNAP_GRID_MM } from "@repo/contracts/floor-plan";
import { useEffect, useState } from "react";

import { distanceMm } from "../geometry/edit-geometry";
import type { EditorTool } from "./types";

const ROOM_CLOSE_THRESHOLD_MM = SNAP_GRID_MM * 3;

type UseDraftDrawingArgs = {
  tool: EditorTool;
  resolveWallStart: (point: Point) => Point;
  resolveWallEnd: (start: Point, point: Point) => Point;
  onWallReady: (start: Point, end: Point) => void;
  onRoomReady: (vertices: Point[], name: string) => void;
};

export function useDraftDrawing({
  tool,
  resolveWallStart,
  resolveWallEnd,
  onWallReady,
  onRoomReady,
}: UseDraftDrawingArgs) {
  const [wallDraftStart, setWallDraftStart] = useState<Point | null>(null);
  const [roomDraftVertices, setRoomDraftVertices] = useState<Point[]>([]);
  const [pendingRoomVertices, setPendingRoomVertices] = useState<Point[] | null>(null);
  const [cursorPoint, setCursorPoint] = useState<Point | null>(null);

  function resetDrafts() {
    setWallDraftStart(null);
    setRoomDraftVertices([]);
    setCursorPoint(null);
  }

  function handleWallPoint(point: Point) {
    if (!wallDraftStart) {
      setWallDraftStart(resolveWallStart(point));
      return;
    }
    const end = resolveWallEnd(wallDraftStart, point);
    if (distanceMm(wallDraftStart, end) >= MIN_WALL_LENGTH_MM) {
      onWallReady(wallDraftStart, end);
    }
    setWallDraftStart(null);
  }

  function updateWallCursor(point: Point) {
    setCursorPoint(wallDraftStart ? resolveWallEnd(wallDraftStart, point) : point);
  }

  function closeRoomLoop(vertices: Point[]) {
    setPendingRoomVertices(vertices);
    setRoomDraftVertices([]);
  }

  function handleRoomPoint(point: Point) {
    const [firstVertex] = roomDraftVertices;
    const canClose =
      firstVertex &&
      roomDraftVertices.length >= 3 &&
      distanceMm(firstVertex, point) <= ROOM_CLOSE_THRESHOLD_MM;
    if (canClose) {
      closeRoomLoop(roomDraftVertices);
      return;
    }
    setRoomDraftVertices((current) => [...current, point]);
  }

  function handlePointerDown(point: Point) {
    if (tool === "wall") handleWallPoint(point);
    else if (tool === "room") handleRoomPoint(point);
  }

  function confirmRoomName(name: string) {
    if (!pendingRoomVertices) return;
    onRoomReady(pendingRoomVertices, name);
    setPendingRoomVertices(null);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        resetDrafts();
        setPendingRoomVertices(null);
      }
      if (event.key === "Enter" && tool === "room" && roomDraftVertices.length >= 3) {
        closeRoomLoop(roomDraftVertices);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tool, roomDraftVertices]);

  return {
    wallDraftStart,
    roomDraftVertices,
    pendingRoomVertices,
    cursorPoint,
    setCursorPoint,
    updateWallCursor,
    resetDrafts,
    handlePointerDown,
    confirmRoomName,
    cancelRoomName: () => setPendingRoomVertices(null),
  };
}
