import { MAX_LOCATIONS_PER_ACCOUNT } from "@repo/contracts/locations";

import type {
  LocationDetailRecord,
  LocationRecord,
  LocationRepository,
  LocationWithLevelCount,
} from "./locations.types.js";

/** Logika domenowa lokalizacji — nie zna Expressa (.claude/rules/api.md). */

export type ListLocationsResult = { items: LocationWithLevelCount[]; nextCursor: string | null };

export function listLocations(
  repository: LocationRepository,
  accountId: string,
  params: { limit: number; cursor: string | null },
): Promise<ListLocationsResult> {
  return repository.listByAccountId(accountId, params);
}

export type CreateLocationResult =
  { status: "ok"; location: LocationRecord } | { status: "limit-reached" };

export async function createLocation(
  repository: LocationRepository,
  accountId: string,
  name: string,
): Promise<CreateLocationResult> {
  const count = await repository.countByAccountId(accountId);
  if (count >= MAX_LOCATIONS_PER_ACCOUNT) return { status: "limit-reached" };

  const location = await repository.create(accountId, name);
  return { status: "ok", location };
}

export type FindLocationResult =
  { status: "ok"; detail: LocationDetailRecord } | { status: "not-found" };

export async function getLocationDetail(
  repository: LocationRepository,
  accountId: string,
  locationId: string,
): Promise<FindLocationResult> {
  const detail = await repository.findDetailById(accountId, locationId);
  return detail ? { status: "ok", detail } : { status: "not-found" };
}

export type UpdateLocationResult =
  { status: "ok"; location: LocationWithLevelCount } | { status: "not-found" };

/**
 * Odpowiedź PATCH to podsumowanie (jak GET/POST na liście), nie pełne
 * szczegóły z poziomami — tamte niesie wyłącznie GET .../:locationId
 * (kształt ustalony przy pisaniu tego serwisu, patrz raport backend-dev).
 */
export async function updateLocationName(
  repository: LocationRepository,
  accountId: string,
  locationId: string,
  name: string,
): Promise<UpdateLocationResult> {
  const updated = await repository.updateName(accountId, locationId, name);
  if (!updated) return { status: "not-found" };

  // Poziom mógł zniknąć między zapisem a odczytem (wyścig z DELETE) — traktujemy jak not-found.
  const detail = await repository.findDetailById(accountId, locationId);
  if (!detail) return { status: "not-found" };

  return { status: "ok", location: { ...updated, levelCount: detail.levels.length } };
}

export type DeleteLocationResult = { status: "ok" } | { status: "not-found" };

export async function deleteLocation(
  repository: LocationRepository,
  accountId: string,
  locationId: string,
): Promise<DeleteLocationResult> {
  const deleted = await repository.delete(accountId, locationId);
  return deleted ? { status: "ok" } : { status: "not-found" };
}
