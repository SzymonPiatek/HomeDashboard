import type { LevelSummary } from "@repo/contracts/locations";
import { Layers } from "lucide-react";
import Link from "next/link";

import { LOCATION_ROUTES } from "../lib/routes";

export function LevelsGridEmpty() {
  return (
    <p className="text-muted-foreground">
      Ta lokalizacja nie ma jeszcze żadnego poziomu. Dodaj pierwszy przyciskiem plusika powyżej.
    </p>
  );
}

type LevelsGridProps = {
  locationId: string;
  levels: LevelSummary[];
  query: string;
};

// `levels` przychodzi już posortowane wg .claude/rules/locations.md — pozycja na
// tej liście, nie `order`, jest numerem widocznym w nawiasie obok nazwy poziomu.
export function LevelsGrid({ locationId, levels, query }: LevelsGridProps) {
  const numberedLevels = levels.map((level, index) => ({ ...level, position: index + 1 }));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredLevels = normalizedQuery
    ? numberedLevels.filter((level) => level.name.toLowerCase().includes(normalizedQuery))
    : numberedLevels;

  if (filteredLevels.length === 0) {
    return <p className="text-muted-foreground">Brak poziomów pasujących do wyszukiwania.</p>;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      {filteredLevels.map((level) => (
        <Link
          key={level.id}
          href={LOCATION_ROUTES.level(locationId, level.id)}
          className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all outline-none hover:-translate-y-0.5 hover:border-ring/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <Layers aria-hidden className="size-14 text-foreground" />
          </span>
          <span className="relative text-sm font-semibold text-foreground">
            {level.name} ({level.position})
          </span>
        </Link>
      ))}
    </div>
  );
}
