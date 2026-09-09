"use client";

import { NAME_MAX_LENGTH, type LevelSummary } from "@repo/contracts/locations";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSetBreadcrumbs } from "@/features/dashboard/lib/breadcrumbs";

import { useCreateLevel, useDeleteLocation, useLocation } from "./api/use-location";
import { ConfirmDeleteButton } from "./components/ConfirmDeleteButton";
import { LOCATION_ROUTES } from "./lib/routes";
import { LocationNameForm } from "./LocationNameForm";

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
  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Poziomy</h2>
      <AddLevelForm locationId={locationId} />
      {sortedLevels.length === 0 ? (
        <p className="text-muted-foreground">Ta lokalizacja nie ma jeszcze żadnego poziomu.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sortedLevels.map((level, index) => (
            <LevelRow key={level.id} locationId={locationId} level={level} position={index + 1} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AddLevelForm({ locationId }: { locationId: string }) {
  const createLevel = useCreateLevel(locationId);
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createLevel.mutate({ name: trimmedName }, { onSuccess: () => setName("") });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="new-level-name" className="text-sm font-medium">
            Nazwa poziomu
          </label>
          <Input
            id="new-level-name"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            onChange={(event) => setName(event.target.value)}
            placeholder="np. Parter"
            required
          />
        </div>
        <Button
          type="submit"
          className="h-11"
          disabled={createLevel.isPending || name.trim().length === 0}
        >
          {createLevel.isPending ? "Dodawanie…" : "Dodaj poziom"}
        </Button>
      </div>
      {createLevel.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {createLevel.error.message}
        </p>
      ) : null}
    </form>
  );
}

function LevelRow({
  locationId,
  level,
  position,
}: {
  locationId: string;
  level: LevelSummary;
  position: number;
}) {
  const label = `Poziom ${position}`;

  return (
    <li>
      <Link
        href={LOCATION_ROUTES.level(locationId, level.id)}
        className="flex min-h-11 flex-col gap-0.5 rounded-lg border bg-card p-3 outline-none transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-medium">{level.name}</span>
      </Link>
    </li>
  );
}
