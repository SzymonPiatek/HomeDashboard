import { floorPlanDocumentSchema, putFloorPlanBodySchema } from "@repo/contracts/floor-plan";
import { levelParamsSchema } from "@repo/contracts/locations";
import type { Router } from "express";

import { ApiError } from "../../http/api-error.js";
import { mapZodIssues } from "../../http/validation.js";
import { getAccountId } from "./auth-context.js";
import { getPlan, putPlan } from "./floor-plan.service.js";
import type { FloorPlanRecord, FloorPlanRepository } from "./locations.types.js";

function toFloorPlanDocument(plan: FloorPlanRecord) {
  return floorPlanDocumentSchema.parse(plan);
}

/** Mounted na /:locationId/levels (mergeParams: true), ścieżka /:levelId/plan. */
export function registerFloorPlanRoutes(router: Router, repository: FloorPlanRepository): void {
  router.get("/:levelId/plan", async (req, res) => {
    const accountId = getAccountId(req);
    const params = levelParamsSchema.parse(req.params);

    const result = await getPlan(repository, accountId, params.locationId, params.levelId);
    if (result.status === "not-found") {
      throw new ApiError(404, "NOT_FOUND", "Nie znaleziono poziomu");
    }

    res.json(toFloorPlanDocument(result.plan));
  });

  router.put("/:levelId/plan", async (req, res) => {
    const accountId = getAccountId(req);
    const params = levelParamsSchema.parse(req.params);
    const parsed = putFloorPlanBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_FAILED",
        "Nieprawidłowy dokument rzutu",
        mapZodIssues(parsed.error),
      );
    }

    const result = await putPlan(repository, {
      accountId,
      locationId: params.locationId,
      levelId: params.levelId,
      expectedVersion: parsed.data.version,
      walls: parsed.data.walls,
      rooms: parsed.data.rooms,
    });

    if (result.status === "not-found") {
      throw new ApiError(404, "NOT_FOUND", "Nie znaleziono poziomu");
    }
    if (result.status === "conflict") {
      throw new ApiError(409, "CONFLICT", "Rzut został zmieniony przez inne urządzenie");
    }

    res.json(toFloorPlanDocument(result.plan));
  });
}
