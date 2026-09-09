import express, { type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { errorHandler } from "../../http/error-handler.js";
import {
  createFakeFloorPlanRepository,
  createFakeLevelRepository,
  createFakeLocationRepository,
} from "./test-support/fakes.js";
import { createLocationsRouter } from "./locations.route.js";

const OWNER_ID = "owner-account";
const INTRUDER_ID = "intruder-account";

/** Symuluje `requireSession`: nagłówek testowy zamiast prawdziwego ciasteczka. */
function fakeAuth(req: Request, _res: Response, next: NextFunction): void {
  const accountId = req.header("x-test-account-id");
  if (accountId) req.auth = { accountId, email: "test@example.com", sessionId: "s1" };
  next();
}

function buildTestApp() {
  const location = createFakeLocationRepository();
  const levelRepository = createFakeLevelRepository(location.levelsByLocation, location.locations);
  const floorPlanRepository = createFakeFloorPlanRepository(
    location.levelsByLocation,
    location.locations,
  );

  const app = express();
  app.use(express.json());
  app.use(fakeAuth);
  app.use(
    "/api/locations",
    createLocationsRouter({
      locationRepository: location.repository,
      levelRepository,
      floorPlanRepository,
    }),
  );
  app.use(errorHandler);

  return { app };
}

function asOwner(app: express.Express) {
  return {
    get: (url: string) => request(app).get(url).set("x-test-account-id", OWNER_ID),
    post: (url: string) => request(app).post(url).set("x-test-account-id", OWNER_ID),
    patch: (url: string) => request(app).patch(url).set("x-test-account-id", OWNER_ID),
    put: (url: string) => request(app).put(url).set("x-test-account-id", OWNER_ID),
    delete: (url: string) => request(app).delete(url).set("x-test-account-id", OWNER_ID),
  };
}

function asIntruder(app: express.Express) {
  return {
    get: (url: string) => request(app).get(url).set("x-test-account-id", INTRUDER_ID),
    patch: (url: string) => request(app).patch(url).set("x-test-account-id", INTRUDER_ID),
    put: (url: string) => request(app).put(url).set("x-test-account-id", INTRUDER_ID),
    delete: (url: string) => request(app).delete(url).set("x-test-account-id", INTRUDER_ID),
  };
}

describe("POST /api/locations", () => {
  it("odrzuca żądanie bez sesji kodem 401", async () => {
    const { app } = buildTestApp();
    const response = await request(app).post("/api/locations").send({ name: "Mieszkanie" });

    expect(response.status).toBe(401);
  });

  it("odrzuca pustą nazwę kodem 400", async () => {
    const { app } = buildTestApp();
    const response = await asOwner(app).post("/api/locations").send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("tworzy lokalizację i zwraca ją z levelCount=0", async () => {
    const { app } = buildTestApp();
    const response = await asOwner(app).post("/api/locations").send({ name: "Mieszkanie" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: "Mieszkanie", levelCount: 0 });
  });
});

describe("izolacja między kontami", () => {
  async function createOwnedLocationAndLevel(app: express.Express) {
    const location = await asOwner(app).post("/api/locations").send({ name: "Mieszkanie" });
    const level = await asOwner(app)
      .post(`/api/locations/${location.body.id}/levels`)
      .send({ name: "Parter" });
    return { locationId: location.body.id as string, levelId: level.body.id as string };
  }

  it("zwraca 404 zamiast 403 dla cudzej lokalizacji, poziomu i rzutu", async () => {
    const { app } = buildTestApp();
    const { locationId, levelId } = await createOwnedLocationAndLevel(app);

    const detail = await asIntruder(app).get(`/api/locations/${locationId}`);
    const rename = await asIntruder(app).patch(`/api/locations/${locationId}`).send({ name: "x" });
    const removeLocation = await asIntruder(app).delete(`/api/locations/${locationId}`);
    const renameLevel = await asIntruder(app)
      .patch(`/api/locations/${locationId}/levels/${levelId}`)
      .send({ name: "x" });
    const removeLevel = await asIntruder(app).delete(
      `/api/locations/${locationId}/levels/${levelId}`,
    );
    const plan = await asIntruder(app).get(`/api/locations/${locationId}/levels/${levelId}/plan`);
    const savePlan = await asIntruder(app)
      .put(`/api/locations/${locationId}/levels/${levelId}/plan`)
      .send({ version: 0, walls: [], rooms: [] });

    for (const response of [
      detail,
      rename,
      removeLocation,
      renameLevel,
      removeLevel,
      plan,
      savePlan,
    ]) {
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    }
  });

  it("nie zmienia danych właściciela mimo prób intruza", async () => {
    const { app } = buildTestApp();
    const { locationId } = await createOwnedLocationAndLevel(app);

    await asIntruder(app).patch(`/api/locations/${locationId}`).send({ name: "Przejęte" });

    const ownerView = await asOwner(app).get(`/api/locations/${locationId}`);
    expect(ownerView.body.name).toBe("Mieszkanie");
  });
});

describe("GET/PUT .../plan", () => {
  it("zwraca pusty dokument (200) dla poziomu bez zapisanego rzutu", async () => {
    const { app } = buildTestApp();
    const location = await asOwner(app).post("/api/locations").send({ name: "Mieszkanie" });
    const level = await asOwner(app)
      .post(`/api/locations/${location.body.id}/levels`)
      .send({ name: "Parter" });

    const response = await asOwner(app).get(
      `/api/locations/${location.body.id}/levels/${level.body.id}/plan`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ version: 0, walls: [], rooms: [] });
  });

  it("odrzuca zapis z nieaktualną wersją kodem 409", async () => {
    const { app } = buildTestApp();
    const location = await asOwner(app).post("/api/locations").send({ name: "Mieszkanie" });
    const level = await asOwner(app)
      .post(`/api/locations/${location.body.id}/levels`)
      .send({ name: "Parter" });
    const planUrl = `/api/locations/${location.body.id}/levels/${level.body.id}/plan`;

    const firstSave = await asOwner(app).put(planUrl).send({ version: 0, walls: [], rooms: [] });
    expect(firstSave.status).toBe(200);
    expect(firstSave.body.version).toBe(1);

    const staleSave = await asOwner(app).put(planUrl).send({ version: 0, walls: [], rooms: [] });
    expect(staleSave.status).toBe(409);
    expect(staleSave.body.error.code).toBe("CONFLICT");
  });
});
