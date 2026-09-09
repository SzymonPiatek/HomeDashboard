"use client";

import type { CreateLocationBody, ListLocationsResponse } from "@repo/contracts/locations";
import { listLocationsResponseSchema } from "@repo/contracts/locations";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { readErrorMessage } from "./http";
import { locationKeys } from "./query-keys";

// Lista zmienia się wyłącznie działaniem tego samego klienta (dodanie/usunięcie
// lokalizacji) — mutacje unieważniają klucz wprost, więc odpytywanie w tle w tym
// oknie jest zbędne (.claude/rules/web.md).
const LOCATIONS_STALE_TIME_MS = 30_000;

async function fetchLocations(cursor: string | undefined): Promise<ListLocationsResponse> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const response = await fetch(`/api/locations${query}`);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Nie udało się pobrać lokalizacji."));
  }

  return listLocationsResponseSchema.parse(await response.json());
}

export function useLocations() {
  return useInfiniteQuery({
    queryKey: locationKeys.all(),
    queryFn: ({ pageParam }) => fetchLocations(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: LOCATIONS_STALE_TIME_MS,
  });
}

async function postLocation(input: CreateLocationBody): Promise<void> {
  const response = await fetch("/api/locations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Nie udało się dodać lokalizacji."));
  }
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all() }),
  });
}
