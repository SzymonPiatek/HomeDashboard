"use client";

import type {
  CreateLevelBody,
  LocationDetail,
  UpdateLevelBody,
  UpdateLocationBody,
} from "@repo/contracts/locations";
import { locationDetailSchema } from "@repo/contracts/locations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { readErrorMessage } from "./http";
import { locationKeys } from "./query-keys";

// Szczegóły zmieniają się wyłącznie przez mutacje tego samego klienta (nazwa,
// dodanie/usunięcie poziomu) — mutacje unieważniają ten sam klucz (.claude/rules/web.md).
const LOCATION_DETAIL_STALE_TIME_MS = 30_000;

async function fetchLocation(locationId: string): Promise<LocationDetail> {
  const response = await fetch(`/api/locations/${locationId}`);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Nie udało się pobrać lokalizacji."));
  }

  return locationDetailSchema.parse(await response.json());
}

export function useLocation(locationId: string) {
  return useQuery({
    queryKey: locationKeys.detail(locationId),
    queryFn: () => fetchLocation(locationId),
    staleTime: LOCATION_DETAIL_STALE_TIME_MS,
  });
}

function useInvalidateLocation(locationId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(locationId) }),
      queryClient.invalidateQueries({ queryKey: locationKeys.all() }),
    ]);
}

async function patchLocation(locationId: string, input: UpdateLocationBody): Promise<void> {
  const response = await fetch(`/api/locations/${locationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Nie udało się zmienić nazwy lokalizacji."));
  }
}

export function useUpdateLocation(locationId: string) {
  const invalidate = useInvalidateLocation(locationId);

  return useMutation({
    mutationFn: (input: UpdateLocationBody) => patchLocation(locationId, input),
    onSuccess: invalidate,
  });
}

async function deleteLocation(locationId: string): Promise<void> {
  const response = await fetch(`/api/locations/${locationId}`, { method: "DELETE" });

  if (!response.ok && response.status !== 204) {
    throw new Error(await readErrorMessage(response, "Nie udało się usunąć lokalizacji."));
  }
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: locationKeys.all() }),
  });
}

async function postLevel(locationId: string, input: CreateLevelBody): Promise<void> {
  const response = await fetch(`/api/locations/${locationId}/levels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Nie udało się dodać poziomu."));
  }
}

export function useCreateLevel(locationId: string) {
  const invalidate = useInvalidateLocation(locationId);

  return useMutation({
    mutationFn: (input: CreateLevelBody) => postLevel(locationId, input),
    onSuccess: invalidate,
  });
}

async function patchLevel(
  locationId: string,
  levelId: string,
  input: UpdateLevelBody,
): Promise<void> {
  const response = await fetch(`/api/locations/${locationId}/levels/${levelId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Nie udało się zmienić nazwy poziomu."));
  }
}

export function useUpdateLevel(locationId: string) {
  const invalidate = useInvalidateLocation(locationId);

  return useMutation({
    mutationFn: ({ levelId, input }: { levelId: string; input: UpdateLevelBody }) =>
      patchLevel(locationId, levelId, input),
    onSuccess: invalidate,
  });
}

async function deleteLevel(locationId: string, levelId: string): Promise<void> {
  const response = await fetch(`/api/locations/${locationId}/levels/${levelId}`, {
    method: "DELETE",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await readErrorMessage(response, "Nie udało się usunąć poziomu."));
  }
}

export function useDeleteLevel(locationId: string) {
  const invalidate = useInvalidateLocation(locationId);

  return useMutation({
    mutationFn: (levelId: string) => deleteLevel(locationId, levelId),
    onSuccess: invalidate,
  });
}
