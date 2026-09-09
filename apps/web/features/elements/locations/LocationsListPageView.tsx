"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetBreadcrumbs } from "@/features/dashboard/lib/breadcrumbs";

import { useLocations } from "./api/use-locations";
import { AddLocationForm } from "./components/AddLocationForm";
import {
  LocationsGrid,
  LocationsGridError,
  LocationsGridSkeleton,
} from "./components/LocationsGrid";

const BREADCRUMBS = [{ label: "Lokalizacje" }];

type OpenPanel = "none" | "search" | "add";

// 500px — czytelna szerokość jednego pola/formularza, nie ma na to tokenu w design systemie.
const PANEL_MAX_WIDTH = "max-w-[500px]";

// Kafelek pulpitu prowadzi tutaj bez propsów (.claude/rules/web.md) — element
// pulpitu obsługujący rzuty; lista jest wejściem, szczegóły i rzut mają własne strony.
export function LocationsListPageView() {
  const locations = useLocations();
  const [openPanel, setOpenPanel] = useState<OpenPanel>("none");
  const [query, setQuery] = useState("");
  useSetBreadcrumbs(BREADCRUMBS);

  // Wyszukiwanie i dodawanie wykluczają się nawzajem — otwarcie jednego chowa drugie.
  function selectPanel(panel: OpenPanel) {
    setOpenPanel((current) => {
      const next = current === panel ? "none" : panel;
      if (next !== "search") setQuery("");
      return next;
    });
  }

  const searchLabel =
    openPanel === "search" ? "Ukryj wyszukiwanie lokalizacji" : "Szukaj lokalizacji";
  const addLabel = openPanel === "add" ? "Zamknij dodawanie lokalizacji" : "Dodaj lokalizację";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Lokalizacje</h1>
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
          <span className="sr-only">Szukaj lokalizacji</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj lokalizacji…"
            autoFocus
          />
        </label>
      ) : null}

      {openPanel === "add" ? <AddLocationForm className={PANEL_MAX_WIDTH} /> : null}

      {locations.isPending ? <LocationsGridSkeleton /> : null}

      {locations.isError ? <LocationsGridError onRetry={() => locations.refetch()} /> : null}

      {locations.isSuccess ? (
        <LocationsGrid
          items={locations.data.pages.flatMap((page) => page.items)}
          query={query}
          hasNextPage={locations.hasNextPage ?? false}
          isFetchingNextPage={locations.isFetchingNextPage}
          onLoadMore={() => locations.fetchNextPage()}
        />
      ) : null}
    </div>
  );
}
