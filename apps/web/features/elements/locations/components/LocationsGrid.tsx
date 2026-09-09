import { Building2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";

import { LOCATION_ROUTES } from "../lib/routes";

export function LocationsGridSkeleton() {
  return (
    <div
      aria-label="Ładowanie lokalizacji"
      className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4"
    >
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} aria-hidden="true" className="aspect-square w-full rounded-xl" />
      ))}
    </div>
  );
}

export function LocationsGridError({ onRetry }: { onRetry: () => void }) {
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

type LocationsGridProps = {
  items: { id: string; name: string }[];
  query: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

export function LocationsGrid({
  items,
  query,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: LocationsGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nie masz jeszcze żadnej lokalizacji. Dodaj pierwszą przyciskiem plusika powyżej.
      </p>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? items.filter((location) => location.name.toLowerCase().includes(normalizedQuery))
    : items;

  if (filteredItems.length === 0) {
    return <p className="text-muted-foreground">Brak lokalizacji pasujących do wyszukiwania.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {filteredItems.map((location) => (
          <Link
            key={location.id}
            href={LOCATION_ROUTES.detail(location.id)}
            className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all outline-none hover:-translate-y-0.5 hover:border-ring/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <Building2 aria-hidden className="size-14 text-foreground" />
            </span>
            <span className="relative text-sm font-semibold text-foreground">{location.name}</span>
          </Link>
        ))}
      </div>
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
