import type {
  FloorPlanRecord,
  FloorPlanRepository,
  RoomInput,
  WallInput,
} from "./locations.types.js";

/** Logika domenowa rzutu — nie zna Expressa (.claude/rules/api.md). */

export type GetPlanResult = { status: "ok"; plan: FloorPlanRecord } | { status: "not-found" };

export async function getPlan(
  repository: FloorPlanRepository,
  accountId: string,
  locationId: string,
  levelId: string,
): Promise<GetPlanResult> {
  // Brak zapisanego rzutu to poprawny stan (200, listy puste) — repozytorium
  // zwraca null wyłącznie, gdy poziom nie istnieje/nie jest własnością konta
  // (.claude/rules/floor-plan.md).
  const plan = await repository.getPlan(accountId, locationId, levelId);
  return plan ? { status: "ok", plan } : { status: "not-found" };
}

export type PutPlanResult =
  { status: "ok"; plan: FloorPlanRecord } | { status: "conflict" } | { status: "not-found" };

export async function putPlan(
  repository: FloorPlanRepository,
  params: {
    accountId: string;
    locationId: string;
    levelId: string;
    expectedVersion: number;
    walls: WallInput[];
    rooms: RoomInput[];
  },
): Promise<PutPlanResult> {
  const result = await repository.savePlan(params);
  return result.status === "saved" ? { status: "ok", plan: result.plan } : result;
}
