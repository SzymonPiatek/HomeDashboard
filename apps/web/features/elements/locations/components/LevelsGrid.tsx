import type { LevelSummary } from "@repo/contracts/locations";
import { Layers } from "lucide-react";

import { Tile } from "@/components/ui/Tile";

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
        <Tile
          key={level.id}
          href={LOCATION_ROUTES.level(locationId, level.id)}
          label={`${level.name} (${level.position})`}
          icon={Layers}
        />
      ))}
    </div>
  );
}
