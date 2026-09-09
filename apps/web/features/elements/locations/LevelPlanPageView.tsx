"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSetBreadcrumbs } from "@/features/dashboard/lib/breadcrumbs";

import { useDeleteLevel, useLocation } from "./api/use-location";
import { useFloorPlan } from "./api/use-floor-plan";
import { ConfirmDeleteButton } from "./components/ConfirmDeleteButton";
import { LOCATION_ROUTES } from "./lib/routes";
import { LevelNameForm } from "./LevelNameForm";
import { type WallVisibilityMode } from "./plan/FloorPlanView3D";
import { FloorPlanViewControls } from "./plan/FloorPlanViewControls";
import { FloorPlanViewer, type ViewMode } from "./plan/FloorPlanViewer";

// Strona poziomu JEST rzutem, bez segmentu /plan (.claude/rules/locations.md).
// Identyfikatory pochodzą z trasy, bez propsów (.claude/rules/web.md). Nazwa,
// zmiana nazwy i usunięcie poziomu mieszkają tu, nie na liście w lokalizacji —
// kafelek poziomu tam jest wyłącznie nawigacyjny.
export function LevelPlanPageView() {
  const { locationId, levelId } = useParams<{ locationId: string; levelId: string }>();
  const router = useRouter();
  const location = useLocation(locationId);
  const plan = useFloorPlan(locationId, levelId);
  const deleteLevel = useDeleteLevel(locationId);
  const [mode, setMode] = useState<ViewMode>("2d");
  const [wallVisibilityMode, setWallVisibilityMode] = useState<WallVisibilityMode>("near-hidden");

  const sortedLevels = useMemo(
    () => [...(location.data?.levels ?? [])].sort((a, b) => a.order - b.order),
    [location.data?.levels],
  );
  const position = sortedLevels.findIndex((candidate) => candidate.id === levelId) + 1;
  const level = sortedLevels.find((candidate) => candidate.id === levelId);

  useSetBreadcrumbs(
    useMemo(
      () => [
        { label: "Lokalizacje", href: LOCATION_ROUTES.list },
        {
          label: location.data?.name ?? "…",
          href: location.data ? LOCATION_ROUTES.detail(locationId) : undefined,
        },
        { label: level?.name ?? "…" },
      ],
      [location.data, locationId, level?.name],
    ),
  );

  if (location.isPending || plan.isPending) {
    return <Skeleton aria-label="Ładowanie poziomu" className="h-96 w-full" />;
  }

  if (location.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="text-destructive">
          Nie udało się pobrać poziomu. Sprawdź połączenie i spróbuj ponownie.
        </p>
        <Button type="button" className="h-11" onClick={() => location.refetch()}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (plan.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="text-destructive">
          Nie udało się pobrać rzutu poziomu. Sprawdź połączenie i spróbuj ponownie.
        </p>
        <Button type="button" className="h-11" onClick={() => plan.refetch()}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (!level) {
    return (
      <p role="alert" className="text-destructive">
        Ten poziom już nie istnieje.
      </p>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <LevelNameForm
          locationId={locationId}
          levelId={levelId}
          currentName={level.name}
          position={position}
        />
        <div className="flex items-center gap-2">
          <FloorPlanViewControls
            mode={mode}
            onModeChange={setMode}
            wallVisibilityMode={wallVisibilityMode}
            onWallVisibilityModeChange={setWallVisibilityMode}
          />
          <ConfirmDeleteButton
            itemLabel={`poziom „${level.name}”`}
            isPending={deleteLevel.isPending}
            onConfirm={() =>
              deleteLevel.mutate(levelId, {
                onSuccess: () => router.push(LOCATION_ROUTES.detail(locationId)),
              })
            }
          />
        </div>
      </div>
      {deleteLevel.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {deleteLevel.error.message}
        </p>
      ) : null}

      {plan.data.walls.length === 0 && plan.data.rooms.length === 0 ? (
        <p className="text-muted-foreground">
          Ten poziom nie ma jeszcze zapisanego rzutu. Pusta siatka poniżej to stan początkowy, nie
          błąd.
        </p>
      ) : null}
      <FloorPlanViewer document={plan.data} mode={mode} wallVisibilityMode={wallVisibilityMode} />
    </div>
  );
}
