import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../../lib/prisma-client.js";
import { createFloorPlanRepository } from "./floor-plan.repository.js";
import { createLevelRepository } from "./level.repository.js";
import { createLocationRepository } from "./location.repository.js";

/**
 * Testuje repozytoria tego modułu (nie atrapy) przeciwko prawdziwej bazie —
 * łańcuch własności jest dokładnie tym, co typy i test na jednym koncie
 * nie wyłapią (.claude/rules/api.md, .claude/rules/locations.md). Uzupełnia
 * `prisma/floor-plan-ownership.test.ts` (data-engineer, schemat), tu chodzi
 * o zapytania zbudowane w warstwie repozytorium backend-dev.
 */
describe("izolacja między kontami w repozytoriach modułu locations", () => {
  const locationRepository = createLocationRepository();
  const levelRepository = createLevelRepository();
  const floorPlanRepository = createFloorPlanRepository();

  let ownerId: string;
  let intruderId: string;
  let locationId: string;
  let levelId: string;

  beforeAll(async () => {
    const owner = await prisma.account.create({
      data: { email: `owner-${randomUUID()}@test.local` },
    });
    const intruder = await prisma.account.create({
      data: { email: `intruder-${randomUUID()}@test.local` },
    });
    ownerId = owner.id;
    intruderId = intruder.id;

    const location = await locationRepository.create(ownerId, "Mieszkanie testowe");
    locationId = location.id;
    const level = await levelRepository.create(ownerId, locationId, "Parter");
    if (!level) throw new Error("expected level to be created for owner");
    levelId = level.id;
  });

  afterAll(async () => {
    await prisma.account.deleteMany({ where: { id: { in: [ownerId, intruderId] } } });
  });

  it("nie zwraca cudzej lokalizacji po poprawnym id", async () => {
    const asOwner = await locationRepository.findDetailById(ownerId, locationId);
    const asIntruder = await locationRepository.findDetailById(intruderId, locationId);

    expect(asOwner?.id).toBe(locationId);
    expect(asIntruder).toBeNull();
  });

  it("nie pozwala zmienić nazwy ani usunąć cudzej lokalizacji", async () => {
    const renamed = await locationRepository.updateName(intruderId, locationId, "Przejęte");
    const deleted = await locationRepository.delete(intruderId, locationId);

    expect(renamed).toBeNull();
    expect(deleted).toBe(false);

    const stillOwners = await locationRepository.findDetailById(ownerId, locationId);
    expect(stillOwners?.name).toBe("Mieszkanie testowe");
  });

  it("nie pozwala dodać, zmienić ani usunąć poziomu w cudzej lokalizacji", async () => {
    const created = await levelRepository.create(intruderId, locationId, "Intruz");
    const renamed = await levelRepository.updateName(intruderId, locationId, levelId, "Przejęty");
    const deleted = await levelRepository.delete(intruderId, locationId, levelId);

    expect(created).toBeNull();
    expect(renamed).toBeNull();
    expect(deleted).toBe(false);
  });

  it("nie zwraca ani nie nadpisuje rzutu cudzego poziomu", async () => {
    const found = await floorPlanRepository.findLevel(intruderId, locationId, levelId);
    const plan = await floorPlanRepository.getPlan(intruderId, locationId, levelId);
    const saved = await floorPlanRepository.savePlan({
      accountId: intruderId,
      locationId,
      levelId,
      expectedVersion: 0,
      walls: [],
      rooms: [],
    });

    expect(found).toBeNull();
    expect(plan).toBeNull();
    expect(saved).toEqual({ status: "not-found" });
  });

  it("zwraca pusty dokument rzutu właścicielowi, gdy nic jeszcze nie zapisano", async () => {
    const plan = await floorPlanRepository.getPlan(ownerId, locationId, levelId);

    expect(plan).toEqual({ version: 0, walls: [], rooms: [] });
  });

  it("odrzuca zapis z nieaktualną wersją kodem konfliktu", async () => {
    const wallId = randomUUID();
    const firstSave = await floorPlanRepository.savePlan({
      accountId: ownerId,
      locationId,
      levelId,
      expectedVersion: 0,
      walls: [
        {
          id: wallId,
          points: [
            { xMm: 0, yMm: 0 },
            { xMm: 1000, yMm: 0 },
            { xMm: 1000, yMm: 1000 },
            { xMm: 0, yMm: 1000 },
          ],
          heightMm: 2500,
        },
      ],
      rooms: [],
    });
    expect(firstSave.status).toBe("saved");

    const staleSave = await floorPlanRepository.savePlan({
      accountId: ownerId,
      locationId,
      levelId,
      expectedVersion: 0,
      walls: [],
      rooms: [],
    });

    expect(staleSave).toEqual({ status: "conflict" });
  });
});
