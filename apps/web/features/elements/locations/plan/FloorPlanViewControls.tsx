"use client";

import { Box, Eye, EyeOff, Map, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { WallVisibilityMode } from "./FloorPlanView3D";
import type { ViewMode } from "./FloorPlanViewer";

const NEXT_WALL_VISIBILITY_MODE: Record<WallVisibilityMode, WallVisibilityMode> = {
  all: "near-hidden",
  "near-hidden": "none",
  none: "all",
};

// Trzy stany nie mają jednej jednoznacznej ikony — zostaje krótki tekst obok ikony,
// żeby nie zgadywać, co dokładnie oznacza środkowy stan.
const WALL_VISIBILITY_MODE_LABEL: Record<WallVisibilityMode, string> = {
  all: "Wszystkie widoczne",
  "near-hidden": "Bliskie ukryte",
  none: "Wszystkie ukryte",
};

const WALL_VISIBILITY_MODE_ICON: Record<WallVisibilityMode, typeof Eye> = {
  all: Eye,
  "near-hidden": Sparkles,
  none: EyeOff,
};

type FloorPlanViewControlsProps = {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  wallVisibilityMode: WallVisibilityMode;
  onWallVisibilityModeChange: (mode: WallVisibilityMode) => void;
};

// Sterowanie widokiem rzutu mieszka w nagłówku strony poziomu, obok pozostałych
// akcji (usunięcie) — nie nad samym rysunkiem, jak wcześniej.
export function FloorPlanViewControls({
  mode,
  onModeChange,
  wallVisibilityMode,
  onWallVisibilityModeChange,
}: FloorPlanViewControlsProps) {
  const isTwoD = mode === "2d";
  const WallVisibilityIcon = WALL_VISIBILITY_MODE_ICON[wallVisibilityMode];

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={isTwoD ? "Przełącz na widok 3D" : "Przełącz na widok 2D"}
        onClick={() => onModeChange(isTwoD ? "3d" : "2d")}
      >
        {isTwoD ? <Box aria-hidden="true" /> : <Map aria-hidden="true" />}
      </Button>
      {isTwoD ? null : (
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-fit"
          onClick={() => onWallVisibilityModeChange(NEXT_WALL_VISIBILITY_MODE[wallVisibilityMode])}
        >
          <WallVisibilityIcon aria-hidden="true" />
          {WALL_VISIBILITY_MODE_LABEL[wallVisibilityMode]}
        </Button>
      )}
    </>
  );
}
