"use client";

import type { FloorPlanDocument } from "@repo/contracts/floor-plan";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { FloorPlanView2D } from "./FloorPlanView2D";
import { FloorPlanView3D } from "./FloorPlanView3D";

type ViewMode = "2d" | "3d";

type FloorPlanViewerProps = {
  document: FloorPlanDocument;
};

// Czysto prezentacyjny — dane pochodzą z hooka API w widoku strony poziomu
// (.claude/rules/floor-plan.md). Bez propsów byłby to element pulpitu, a to
// wewnętrzny komponent renderera.
export function FloorPlanViewer({ document }: FloorPlanViewerProps) {
  const [mode, setMode] = useState<ViewMode>("2d");
  const isTwoD = mode === "2d";

  return (
    <div className="flex flex-1 flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-fit"
        onClick={() => setMode(isTwoD ? "3d" : "2d")}
      >
        {isTwoD ? "Przełącz na widok 3D" : "Przełącz na widok 2D"}
      </Button>
      <div className="flex min-h-96 flex-1 flex-col">
        {isTwoD ? <FloorPlanView2D document={document} /> : <FloorPlanView3D document={document} />}
      </div>
    </div>
  );
}
