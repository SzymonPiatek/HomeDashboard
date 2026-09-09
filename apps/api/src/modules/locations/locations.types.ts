/**
 * Typy domenowe modułu (.claude/rules/api.md — repozytorium zwraca typy domenowe,
 * nie modele Prismy jeden do jednego). `accountId` żyje wyłącznie na Location
 * (.claude/rules/locations.md); reszta łańcucha jest zawężana w zapytaniu, nie
 * w typie zwracanym.
 */

export type LocationRecord = {
  id: string;
  name: string;
  createdAt: Date;
};

export type LocationWithLevelCount = LocationRecord & { levelCount: number };

export type LevelSummaryRecord = {
  id: string;
  name: string;
  order: number;
};

export type LocationDetailRecord = LocationRecord & { levels: LevelSummaryRecord[] };

export type LevelRecord = LevelSummaryRecord & { version: number };

export type Point = { xMm: number; yMm: number };

export type WallRecord = {
  id: string;
  points: [Point, Point, Point, Point];
  heightMm: number;
};

export type RoomRecord = {
  id: string;
  name: string;
  vertices: Point[];
};

export type FloorPlanRecord = {
  version: number;
  walls: WallRecord[];
  rooms: RoomRecord[];
};

export type WallInput = WallRecord;
export type RoomInput = RoomRecord;

export type SavePlanResult =
  { status: "saved"; plan: FloorPlanRecord } | { status: "conflict" } | { status: "not-found" };

export type LocationRepository = {
  countByAccountId(accountId: string): Promise<number>;
  listByAccountId(
    accountId: string,
    params: { limit: number; cursor: string | null },
  ): Promise<{ items: LocationWithLevelCount[]; nextCursor: string | null }>;
  create(accountId: string, name: string): Promise<LocationRecord>;
  findDetailById(accountId: string, locationId: string): Promise<LocationDetailRecord | null>;
  updateName(accountId: string, locationId: string, name: string): Promise<LocationRecord | null>;
  delete(accountId: string, locationId: string): Promise<boolean>;
};

export type LevelRepository = {
  countByLocationId(accountId: string, locationId: string): Promise<number | null>;
  create(accountId: string, locationId: string, name: string): Promise<LevelRecord | null>;
  updateName(
    accountId: string,
    locationId: string,
    levelId: string,
    name: string,
  ): Promise<LevelRecord | null>;
  delete(accountId: string, locationId: string, levelId: string): Promise<boolean>;
};

export type FloorPlanRepository = {
  findLevel(accountId: string, locationId: string, levelId: string): Promise<{ id: string } | null>;
  getPlan(accountId: string, locationId: string, levelId: string): Promise<FloorPlanRecord | null>;
  savePlan(params: {
    accountId: string;
    locationId: string;
    levelId: string;
    expectedVersion: number;
    walls: WallInput[];
    rooms: RoomInput[];
  }): Promise<SavePlanResult>;
};
