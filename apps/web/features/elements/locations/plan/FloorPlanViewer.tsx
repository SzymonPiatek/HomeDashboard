"use client";

import type { FloorPlanDocument } from "@repo/contracts/floor-plan";

import { FloorPlanView2D } from "./FloorPlanView2D";
import { FloorPlanView3D, type WallVisibilityMode } from "./FloorPlanView3D";

export type ViewMode = "2d" | "3d";

type FloorPlanViewerProps = {
  locationId: string;
  levelId: string;
  document: FloorPlanDocument;
  mode: ViewMode;
  wallVisibilityMode: WallVisibilityMode;
  isEditMode: boolean;
};

export function FloorPlanViewer({
  locationId,
  levelId,
  document,
  mode,
  wallVisibilityMode,
  isEditMode,
}: FloorPlanViewerProps) {
  return (
    <div className="flex min-h-96 flex-1 flex-col">
      {mode === "2d" ? (
        <FloorPlanView2D
          locationId={locationId}
          levelId={levelId}
          document={document}
          isEditMode={isEditMode}
        />
      ) : (
        <FloorPlanView3D document={document} wallVisibilityMode={wallVisibilityMode} />
      )}
    </div>
  );
}
