"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { FloorPlanView2D } from "./FloorPlanView2D";
import { FloorPlanView3D } from "./FloorPlanView3D";
import { FLOOR_PLAN_TEST_DATA } from "./test-data";

type ViewMode = "2d" | "3d";

export function FloorPlanViewer() {
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
      <div className="flex min-h-96 flex-1 flex-col rounded-lg border bg-card">
        {isTwoD ? (
          <FloorPlanView2D data={FLOOR_PLAN_TEST_DATA} />
        ) : (
          <FloorPlanView3D data={FLOOR_PLAN_TEST_DATA} />
        )}
      </div>
    </div>
  );
}
