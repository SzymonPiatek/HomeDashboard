import { Router } from "express";

import { createFloorPlanRepository } from "./floor-plan.repository.js";
import { registerFloorPlanRoutes } from "./floor-plan.route.js";
import { createLevelRepository } from "./level.repository.js";
import { registerLevelRoutes } from "./level.route.js";
import { createLocationRepository } from "./location.repository.js";
import { registerLocationRoutes } from "./location.route.js";
import type {
  FloorPlanRepository,
  LevelRepository,
  LocationRepository,
} from "./locations.types.js";

export type LocationsRouterDeps = {
  locationRepository?: LocationRepository;
  levelRepository?: LevelRepository;
  floorPlanRepository?: FloorPlanRepository;
};

/**
 * Router modułu — montowany pod /api/locations w app.ts, za `requireSession`
 * (.claude/rules/locations.md). `locationId` zawsze w ścieżce, także dla
 * poziomów i rzutu: mergeParams:true przenosi go do podrouterów.
 */
export function createLocationsRouter(deps: LocationsRouterDeps = {}): Router {
  const locationRepository = deps.locationRepository ?? createLocationRepository();
  const levelRepository = deps.levelRepository ?? createLevelRepository();
  const floorPlanRepository = deps.floorPlanRepository ?? createFloorPlanRepository();

  const router = Router();
  registerLocationRoutes(router, locationRepository);

  const levelRouter = Router({ mergeParams: true });
  registerLevelRoutes(levelRouter, levelRepository);
  registerFloorPlanRoutes(levelRouter, floorPlanRepository);
  router.use("/:locationId/levels", levelRouter);

  return router;
}
