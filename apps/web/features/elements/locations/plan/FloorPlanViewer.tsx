"use client";

import type { FloorPlanDocument } from "@repo/contracts/floor-plan";

import { FloorPlanView2D } from "./FloorPlanView2D";
import { FloorPlanView3D, type WallVisibilityMode } from "./FloorPlanView3D";

export type ViewMode = "2d" | "3d";

type FloorPlanViewerProps = {
  document: FloorPlanDocument;
  mode: ViewMode;
  wallVisibilityMode: WallVisibilityMode;
};

// Czysto prezentacyjny — dane pochodzą z hooka API w widoku strony poziomu
// (.claude/rules/floor-plan.md). Sterowanie trybem widoku mieszka w nagłówku
// strony (LevelPlanPageView, FloorPlanViewControls), nie tutaj.
export function FloorPlanViewer({ document, mode, wallVisibilityMode }: FloorPlanViewerProps) {
  return (
    <div className="flex min-h-96 flex-1 flex-col">
      {mode === "2d" ? (
        <FloorPlanView2D document={document} />
      ) : (
        <FloorPlanView3D document={document} wallVisibilityMode={wallVisibilityMode} />
      )}
    </div>
  );
}
