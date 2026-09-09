"use client";

import type { LevelSummary } from "@repo/contracts/locations";
import { Plus, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSetBreadcrumbs } from "@/features/dashboard/lib/breadcrumbs";

import { useDeleteLocation, useLocation } from "./api/use-location";
import { AddLevelForm } from "./components/AddLevelForm";
import { ConfirmDeleteButton } from "./components/ConfirmDeleteButton";
import { LevelsGrid, LevelsGridEmpty } from "./components/LevelsGrid";
import { LOCATION_ROUTES } from "./lib/routes";
import { LocationNameForm } from "./LocationNameForm";

type OpenPanel = "none" | "search" | "add";

// 500px — czytelna szerokość jednego pola/formularza, nie ma na to tokenu w design systemie.
const PANEL_MAX_WIDTH = "max-w-[500px]";

// Strona szczegółów lokalizacji nie przyjmuje propsów — identyfikator pochodzi
// z trasy (.claude/rules/web.md, sekcja "Widoki stron elementu").
export function LocationDetailPageView() {
  const { locationId } = useParams<{ locationId: string }>();
  const router = useRouter();
  const location = useLocation(locationId);
  const deleteLocation = useDeleteLocation();

  useSetBreadcrumbs(
    useMemo(
      () => [
        { label: "Lokalizacje", href: LOCATION_ROUTES.list },
        { label: location.data?.name ?? "…" },
      ],
      [location.data?.name],
    ),
  );

  if (location.isPending) {
    return <Skeleton aria-label="Ładowanie lokalizacji" className="h-48 w-full" />;
  }

  if (location.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="text-destructive">
          Nie udało się pobrać lokalizacji. Sprawdź połączenie i spróbuj ponownie.
        </p>
        <Button type="button" className="h-11" onClick={() => location.refetch()}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  const data = location.data;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <LocationNameForm locationId={locationId} currentName={data.name} />
        <ConfirmDeleteButton
          itemLabel={`lokalizację „${data.name}”`}
          isPending={deleteLocation.isPending}
          onConfirm={() =>
            deleteLocation.mutate(locationId, {
              onSuccess: () => router.push(LOCATION_ROUTES.list),
            })
          }
        />
      </div>
      {deleteLocation.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {deleteLocation.error.message}
        </p>
      ) : null}

      <LevelsSection locationId={locationId} levels={data.levels} />
    </div>
  );
}

function LevelsSection({ locationId, levels }: { locationId: string; levels: LevelSummary[] }) {
  const sortedLevels = useMemo(() => [...levels].sort((a, b) => a.order - b.order), [levels]);
  const [openPanel, setOpenPanel] = useState<OpenPanel>("none");
  const [query, setQuery] = useState("");

  // Wyszukiwanie i dodawanie wykluczają się nawzajem — otwarcie jednego chowa drugie.
  function selectPanel(panel: OpenPanel) {
    setOpenPanel((current) => {
      const next = current === panel ? "none" : panel;
      if (next !== "search") setQuery("");
      return next;
    });
  }

  const searchLabel = openPanel === "search" ? "Ukryj wyszukiwanie poziomów" : "Szukaj poziomów";
  const addLabel = openPanel === "add" ? "Zamknij dodawanie poziomu" : "Dodaj poziom";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Poziomy</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11"
            aria-pressed={openPanel === "search"}
            aria-label={searchLabel}
            tooltip={searchLabel}
            onClick={() => selectPanel("search")}
          >
            <Search aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11"
            aria-pressed={openPanel === "add"}
            aria-label={addLabel}
            tooltip={addLabel}
            onClick={() => selectPanel("add")}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
      </div>

      {openPanel === "search" ? (
        <label className={`flex flex-col gap-1 ${PANEL_MAX_WIDTH}`}>
          <span className="sr-only">Szukaj poziomów</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj poziomów…"
            autoFocus
          />
        </label>
      ) : null}

      {openPanel === "add" ? (
        <AddLevelForm locationId={locationId} className={PANEL_MAX_WIDTH} />
      ) : null}

      {sortedLevels.length === 0 ? (
        <LevelsGridEmpty />
      ) : (
        <LevelsGrid locationId={locationId} levels={sortedLevels} query={query} />
      )}
    </div>
  );
}
