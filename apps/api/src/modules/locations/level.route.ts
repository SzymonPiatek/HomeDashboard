import {
  createLevelBodySchema,
  levelParamsSchema,
  levelSummarySchema,
  updateLevelBodySchema,
} from "@repo/contracts/locations";
import type { Router } from "express";

import { ApiError } from "../../http/api-error.js";
import { mapZodIssues } from "../../http/validation.js";
import { getAccountId } from "./auth-context.js";
import { createLevel, deleteLevel, updateLevelName } from "./level.service.js";
import type { LevelRecord, LevelRepository } from "./locations.types.js";

function toLevelSummary(level: LevelRecord) {
  return levelSummarySchema.parse({ id: level.id, name: level.name, order: level.order });
}

/** Mounted na /:locationId/levels (mergeParams: true) — locationId z URL nadrzędnego. */
export function registerLevelRoutes(router: Router, repository: LevelRepository): void {
  router.post("/", async (req, res) => {
    const accountId = getAccountId(req);
    const { locationId } = levelParamsSchema.pick({ locationId: true }).parse(req.params);
    const parsed = createLevelBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_FAILED",
        "Nieprawidłowe dane poziomu",
        mapZodIssues(parsed.error),
      );
    }

    const result = await createLevel(repository, accountId, locationId, parsed.data.name);
    if (result.status === "not-found") {
      throw new ApiError(404, "NOT_FOUND", "Nie znaleziono lokalizacji");
    }
    if (result.status === "limit-reached") {
      throw new ApiError(409, "CONFLICT", "Osiągnięto limit poziomów w tej lokalizacji");
    }

    res.status(201).json(toLevelSummary(result.level));
  });

  router.patch("/:levelId", async (req, res) => {
    const accountId = getAccountId(req);
    const params = levelParamsSchema.parse(req.params);
    const parsed = updateLevelBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_FAILED",
        "Nieprawidłowe dane poziomu",
        mapZodIssues(parsed.error),
      );
    }

    const result = await updateLevelName(
      repository,
      accountId,
      params.locationId,
      params.levelId,
      parsed.data.name,
    );
    if (result.status === "not-found") {
      throw new ApiError(404, "NOT_FOUND", "Nie znaleziono poziomu");
    }

    res.json(toLevelSummary(result.level));
  });

  router.delete("/:levelId", async (req, res) => {
    const accountId = getAccountId(req);
    const params = levelParamsSchema.parse(req.params);

    const result = await deleteLevel(repository, accountId, params.locationId, params.levelId);
    if (result.status === "not-found") {
      throw new ApiError(404, "NOT_FOUND", "Nie znaleziono poziomu");
    }

    res.status(204).end();
  });
}
