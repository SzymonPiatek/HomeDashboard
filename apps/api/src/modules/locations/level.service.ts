import { MAX_LEVELS_PER_LOCATION } from "@repo/contracts/locations";

import type { LevelRecord, LevelRepository } from "./locations.types.js";

/** Logika domenowa poziomów — nie zna Expressa (.claude/rules/api.md). */

export type CreateLevelResult =
  { status: "ok"; level: LevelRecord } | { status: "not-found" } | { status: "limit-reached" };

export async function createLevel(
  repository: LevelRepository,
  accountId: string,
  locationId: string,
  name: string,
): Promise<CreateLevelResult> {
  const count = await repository.countByLocationId(accountId, locationId);
  if (count === null) return { status: "not-found" };
  if (count >= MAX_LEVELS_PER_LOCATION) return { status: "limit-reached" };

  const level = await repository.create(accountId, locationId, name);
  return level ? { status: "ok", level } : { status: "not-found" };
}

export type UpdateLevelResult = { status: "ok"; level: LevelRecord } | { status: "not-found" };

export async function updateLevelName(
  repository: LevelRepository,
  accountId: string,
  locationId: string,
  levelId: string,
  name: string,
): Promise<UpdateLevelResult> {
  const level = await repository.updateName(accountId, locationId, levelId, name);
  return level ? { status: "ok", level } : { status: "not-found" };
}

export type DeleteLevelResult = { status: "ok" } | { status: "not-found" };

export async function deleteLevel(
  repository: LevelRepository,
  accountId: string,
  locationId: string,
  levelId: string,
): Promise<DeleteLevelResult> {
  const deleted = await repository.delete(accountId, locationId, levelId);
  return deleted ? { status: "ok" } : { status: "not-found" };
}
