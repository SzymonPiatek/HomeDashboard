import {
  createLocationBodySchema,
  listLocationsQuerySchema,
  listLocationsResponseSchema,
  locationDetailSchema,
  locationParamsSchema,
  locationSummarySchema,
  updateLocationBodySchema,
} from "@repo/contracts/locations";
import type { Router } from "express";

import { ApiError } from "../../http/api-error.js";
import { mapZodIssues } from "../../http/validation.js";
import { getAccountId } from "./auth-context.js";
import {
  createLocation,
  deleteLocation,
  getLocationDetail,
  listLocations,
  updateLocationName,
} from "./location.service.js";
import type {
  LocationDetailRecord,
  LocationRepository,
  LocationWithLevelCount,
} from "./locations.types.js";

function toLocationSummary(location: LocationWithLevelCount) {
  return locationSummarySchema.parse({
    id: location.id,
    name: location.name,
    levelCount: location.levelCount,
    createdAt: location.createdAt.toISOString(),
  });
}

function toLocationDetail(detail: LocationDetailRecord) {
  return locationDetailSchema.parse({
    id: detail.id,
    name: detail.name,
    levels: detail.levels,
  });
}

export function registerLocationRoutes(router: Router, repository: LocationRepository): void {
  router.get("/", async (req, res) => {
    const accountId = getAccountId(req);
    const parsed = listLocationsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_FAILED",
        "Nieprawidłowe parametry stronicowania",
        mapZodIssues(parsed.error),
      );
    }

    const result = await listLocations(repository, accountId, {
      limit: parsed.data.limit,
      cursor: parsed.data.cursor ?? null,
    });

    res.json(
      listLocationsResponseSchema.parse({
        items: result.items.map(toLocationSummary),
        nextCursor: result.nextCursor,
      }),
    );
  });

  router.post("/", async (req, res) => {
    const accountId = getAccountId(req);
    const parsed = createLocationBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_FAILED",
        "Nieprawidłowe dane lokalizacji",
        mapZodIssues(parsed.error),
      );
    }

    const result = await createLocation(repository, accountId, parsed.data.name);
    if (result.status === "limit-reached") {
      throw new ApiError(409, "CONFLICT", "Osiągnięto limit lokalizacji na konto");
    }

    res.status(201).json(toLocationSummary({ ...result.location, levelCount: 0 }));
  });

  router.get("/:locationId", async (req, res) => {
    const accountId = getAccountId(req);
    const params = locationParamsSchema.parse(req.params);

    const result = await getLocationDetail(repository, accountId, params.locationId);
    if (result.status === "not-found") {
      throw new ApiError(404, "NOT_FOUND", "Nie znaleziono lokalizacji");
    }

    res.json(toLocationDetail(result.detail));
  });

  router.patch("/:locationId", async (req, res) => {
    const accountId = getAccountId(req);
    const params = locationParamsSchema.parse(req.params);
    const parsed = updateLocationBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_FAILED",
        "Nieprawidłowe dane lokalizacji",
        mapZodIssues(parsed.error),
      );
    }

    const result = await updateLocationName(
      repository,
      accountId,
      params.locationId,
      parsed.data.name,
    );
    if (result.status === "not-found") {
      throw new ApiError(404, "NOT_FOUND", "Nie znaleziono lokalizacji");
    }

    res.json(toLocationSummary(result.location));
  });

  router.delete("/:locationId", async (req, res) => {
    const accountId = getAccountId(req);
    const params = locationParamsSchema.parse(req.params);

    const result = await deleteLocation(repository, accountId, params.locationId);
    if (result.status === "not-found") {
      throw new ApiError(404, "NOT_FOUND", "Nie znaleziono lokalizacji");
    }

    res.status(204).end();
  });
}
