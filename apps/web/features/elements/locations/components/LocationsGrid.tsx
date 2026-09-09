import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tile } from "@/components/ui/Tile";

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
          <Tile
            key={location.id}
            href={LOCATION_ROUTES.detail(location.id)}
            label={location.name}
            icon={Building2}
          />
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
