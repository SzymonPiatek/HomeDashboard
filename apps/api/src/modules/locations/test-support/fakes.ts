import { randomUUID } from "node:crypto";

import type {
  FloorPlanRecord,
  FloorPlanRepository,
  LevelRecord,
  LevelRepository,
  LocationDetailRecord,
  LocationRepository,
  LocationWithLevelCount,
  RoomInput,
  WallInput,
} from "../locations.types.js";

/**
 * Atrapy w pamięci dla testów route/service, filtrujące po `accountId` tak,
 * jak zrobiłoby to prawdziwe zapytanie — pozwala testować, że warstwa route/
 * service poprawnie przekazuje i interpretuje właścicielstwo, bez bazy danych.
 * Poprawność samych zapytań Prismy sprawdza `locations.repository.test.ts`.
 */

type StoredLocation = { id: string; accountId: string; name: string; createdAt: Date };
type StoredLevel = { id: string; locationId: string; name: string; order: number; version: number };

export function createFakeLocationRepository(seed: StoredLocation[] = []) {
  const locations = new Map(seed.map((location) => [location.id, location]));
  const levelsByLocation = new Map<string, StoredLevel[]>();

  const repository: LocationRepository = {
    async countByAccountId(accountId) {
      return [...locations.values()].filter((l) => l.accountId === accountId).length;
    },

    async listByAccountId(accountId, { limit }) {
      const items: LocationWithLevelCount[] = [...locations.values()]
        .filter((l) => l.accountId === accountId)
        .slice(0, limit)
        .map((l) => toWithLevelCount(l, levelsByLocation.get(l.id) ?? []));
      return { items, nextCursor: null };
    },

    async create(accountId, name) {
      const location: StoredLocation = { id: randomUUID(), accountId, name, createdAt: new Date() };
      locations.set(location.id, location);
      return location;
    },

    async findDetailById(accountId, locationId): Promise<LocationDetailRecord | null> {
      const location = locations.get(locationId);
      if (!location || location.accountId !== accountId) return null;

      return { ...location, levels: (levelsByLocation.get(locationId) ?? []).map(toLevelSummary) };
    },

    async updateName(accountId, locationId, name) {
      const location = locations.get(locationId);
      if (!location || location.accountId !== accountId) return null;

      const updated = { ...location, name };
      locations.set(locationId, updated);
      return updated;
    },

    async delete(accountId, locationId) {
      const location = locations.get(locationId);
      if (!location || location.accountId !== accountId) return false;

      locations.delete(locationId);
      return true;
    },
  };

  return { repository, locations, levelsByLocation };
}

export function createFakeLevelRepository(
  levelsByLocation: Map<string, StoredLevel[]>,
  locations: Map<string, StoredLocation>,
) {
  const repository: LevelRepository = {
    async countByLocationId(accountId, locationId) {
      const location = locations.get(locationId);
      if (!location || location.accountId !== accountId) return null;
      return (levelsByLocation.get(locationId) ?? []).length;
    },

    async create(accountId, locationId, name) {
      const location = locations.get(locationId);
      if (!location || location.accountId !== accountId) return null;

      const existing = levelsByLocation.get(locationId) ?? [];
      const order = existing.length === 0 ? 0 : Math.max(...existing.map((l) => l.order)) + 1;
      const level: StoredLevel = { id: randomUUID(), locationId, name, order, version: 0 };
      levelsByLocation.set(locationId, [...existing, level]);
      return level;
    },

    async updateName(accountId, locationId, levelId, name) {
      const level = findOwned(levelsByLocation, locations, accountId, locationId, levelId);
      if (!level) return null;

      level.name = name;
      return level;
    },

    async delete(accountId, locationId, levelId) {
      const level = findOwned(levelsByLocation, locations, accountId, locationId, levelId);
      if (!level) return false;

      const remaining = (levelsByLocation.get(locationId) ?? []).filter((l) => l.id !== levelId);
      levelsByLocation.set(locationId, remaining);
      return true;
    },
  };

  return repository;
}

export function createFakeFloorPlanRepository(
  levelsByLocation: Map<string, StoredLevel[]>,
  locations: Map<string, StoredLocation>,
) {
  const plans = new Map<string, FloorPlanRecord>();

  const repository: FloorPlanRepository = {
    async findLevel(accountId, locationId, levelId) {
      const level = findOwned(levelsByLocation, locations, accountId, locationId, levelId);
      return level ? { id: level.id } : null;
    },

    async getPlan(accountId, locationId, levelId) {
      const level = findOwned(levelsByLocation, locations, accountId, locationId, levelId);
      if (!level) return null;

      return plans.get(levelId) ?? { version: level.version, walls: [], rooms: [] };
    },

    async savePlan({ accountId, locationId, levelId, expectedVersion, walls, rooms }) {
      const level = findOwned(levelsByLocation, locations, accountId, locationId, levelId);
      if (!level) return { status: "not-found" };
      if (level.version !== expectedVersion) return { status: "conflict" };

      level.version += 1;
      const plan: FloorPlanRecord = {
        version: level.version,
        walls: walls as WallInput[],
        rooms: rooms as RoomInput[],
      };
      plans.set(levelId, plan);
      return { status: "saved", plan };
    },
  };

  return repository;
}

function findOwned(
  levelsByLocation: Map<string, StoredLevel[]>,
  locations: Map<string, StoredLocation>,
  accountId: string,
  locationId: string,
  levelId: string,
): StoredLevel | null {
  const location = locations.get(locationId);
  if (!location || location.accountId !== accountId) return null;

  return (levelsByLocation.get(locationId) ?? []).find((l) => l.id === levelId) ?? null;
}

function toLevelSummary(level: StoredLevel) {
  return { id: level.id, name: level.name, order: level.order };
}

function toWithLevelCount(location: StoredLocation, levels: StoredLevel[]): LocationWithLevelCount {
  return { ...location, levelCount: levels.length };
}

export type { LevelRecord, StoredLevel, StoredLocation };
