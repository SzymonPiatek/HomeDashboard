"use client";

import { NAME_MAX_LENGTH } from "@repo/contracts/locations";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSetBreadcrumbs } from "@/features/dashboard/lib/breadcrumbs";

import { useCreateLocation, useLocations } from "./api/use-locations";
import { LOCATION_ROUTES } from "./lib/routes";

const BREADCRUMBS = [{ label: "Lokalizacje" }];

// Kafelek pulpitu prowadzi tutaj bez propsów (.claude/rules/web.md) — element
// pulpitu obsługujący rzuty; lista jest wejściem, szczegóły i rzut mają własne strony.
export function LocationsListPageView() {
  const locations = useLocations();
  useSetBreadcrumbs(BREADCRUMBS);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Lokalizacje</h1>
        <p className="text-muted-foreground">Mieszkania i budynki, w których żyjesz.</p>
      </div>

      <AddLocationForm />

      {locations.isPending ? <LocationsListSkeleton /> : null}

      {locations.isError ? <ErrorState onRetry={() => locations.refetch()} /> : null}

      {locations.isSuccess ? (
        <LocationsList
          items={locations.data.pages.flatMap((page) => page.items)}
          hasNextPage={locations.hasNextPage ?? false}
          isFetchingNextPage={locations.isFetchingNextPage}
          onLoadMore={() => locations.fetchNextPage()}
        />
      ) : null}
    </div>
  );
}

function AddLocationForm() {
  const createLocation = useCreateLocation();
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createLocation.mutate({ name: trimmedName }, { onSuccess: () => setName("") });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="new-location-name" className="text-sm font-medium">
            Nazwa lokalizacji
          </label>
          <Input
            id="new-location-name"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
            placeholder="np. Mieszkanie"
            required
          />
        </div>
        <Button
          type="submit"
          className="h-11"
          disabled={createLocation.isPending || name.trim().length === 0}
        >
          {createLocation.isPending ? "Dodawanie…" : "Dodaj lokalizację"}
        </Button>
      </div>
      {createLocation.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {createLocation.error.message}
        </p>
      ) : null}
    </form>
  );
}

function LocationsListSkeleton() {
  return (
    <div aria-label="Ładowanie lokalizacji" className="flex flex-col gap-2">
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} aria-hidden="true" className="h-14 w-full" />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p role="alert" className="text-destructive">
        Nie udało się pobrać lokalizacji. Sprawdź połączenie i spróbuj ponownie.
      </p>
      <Button type="button" className="h-11" onClick={onRetry}>
        Spróbuj ponownie
      </Button>
    </div>
  );
}

type LocationsListProps = {
  items: { id: string; name: string }[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

function LocationsList({ items, hasNextPage, isFetchingNextPage, onLoadMore }: LocationsListProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nie masz jeszcze żadnej lokalizacji. Dodaj pierwszą powyżej.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {items.map((location) => (
          <li key={location.id}>
            <Link
              href={LOCATION_ROUTES.detail(location.id)}
              className="flex h-14 items-center rounded-lg border bg-card px-4 hover:bg-accent hover:text-accent-foreground"
            >
              {location.name}
            </Link>
          </li>
        ))}
      </ul>
      {hasNextPage ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-fit"
          disabled={isFetchingNextPage}
          onClick={onLoadMore}
        >
          {isFetchingNextPage ? "Wczytywanie…" : "Wczytaj więcej lokalizacji"}
        </Button>
      ) : null}
    </div>
  );
}
