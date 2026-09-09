"use client";

import { floorPlanDocumentSchema } from "@repo/contracts/floor-plan";
import { useQuery } from "@tanstack/react-query";

import { readErrorMessage } from "./http";
import { locationKeys } from "./query-keys";

// Rzut zmienia się wyłącznie przez zapis tego samego klienta (PUT nie ma jeszcze
// UI — BL-020), więc krótkie odświeżanie w tle wystarcza (.claude/rules/web.md).
const PLAN_STALE_TIME_MS = 30_000;

async function fetchFloorPlan(locationId: string, levelId: string) {
  const response = await fetch(`/api/locations/${locationId}/levels/${levelId}/plan`);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Nie udało się pobrać rzutu poziomu."));
  }

  return floorPlanDocumentSchema.parse(await response.json());
}

// Poziom bez zapisanego rzutu odpowiada 200 z pustym dokumentem — nie 404
// (.claude/rules/floor-plan.md), więc pusty stan obsługuje ten sam hook.
export function useFloorPlan(locationId: string, levelId: string) {
  return useQuery({
    queryKey: locationKeys.plan(locationId, levelId),
    queryFn: () => fetchFloorPlan(locationId, levelId),
    staleTime: PLAN_STALE_TIME_MS,
  });
}
