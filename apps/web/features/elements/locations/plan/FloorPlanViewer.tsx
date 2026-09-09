"use client";

import type { FloorPlanDocument } from "@repo/contracts/floor-plan";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { FloorPlanView2D } from "./FloorPlanView2D";
import { FloorPlanView3D, type WallVisibilityMode } from "./FloorPlanView3D";

type ViewMode = "2d" | "3d";

const NEXT_WALL_VISIBILITY_MODE: Record<WallVisibilityMode, WallVisibilityMode> = {
  all: "near-hidden",
  "near-hidden": "none",
  none: "all",
};

const WALL_VISIBILITY_MODE_LABEL: Record<WallVisibilityMode, string> = {
  all: "Ściany: wszystkie widoczne",
  "near-hidden": "Ściany: bliskie ukryte",
  none: "Ściany: wszystkie ukryte",
};

type FloorPlanViewerProps = {
  document: FloorPlanDocument;
};

// Czysto prezentacyjny — dane pochodzą z hooka API w widoku strony poziomu
// (.claude/rules/floor-plan.md). Bez propsów byłby to element pulpitu, a to
// wewnętrzny komponent renderera.
export function FloorPlanViewer({ document }: FloorPlanViewerProps) {
  const [mode, setMode] = useState<ViewMode>("2d");
  const [wallVisibilityMode, setWallVisibilityMode] = useState<WallVisibilityMode>("near-hidden");
  const isTwoD = mode === "2d";

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-fit"
          onClick={() => setMode(isTwoD ? "3d" : "2d")}
        >
          {isTwoD ? "Przełącz na widok 3D" : "Przełącz na widok 2D"}
        </Button>
        {isTwoD ? null : (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-fit"
            onClick={() => setWallVisibilityMode((current) => NEXT_WALL_VISIBILITY_MODE[current])}
          >
            {WALL_VISIBILITY_MODE_LABEL[wallVisibilityMode]}
          </Button>
        )}
      </div>
      <div className="flex min-h-96 flex-1 flex-col">
        {isTwoD ? (
          <FloorPlanView2D document={document} />
        ) : (
          <FloorPlanView3D document={document} wallVisibilityMode={wallVisibilityMode} />
        )}
      </div>
    </div>
  );
}
