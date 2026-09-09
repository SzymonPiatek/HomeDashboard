import { Router } from "express";

import { getHealthStatus } from "./health.service.js";

/** Publiczny świadomie: healthcheck kontenera i proxy (.claude/rules/ops.md). */
export function createHealthRouter(): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json(getHealthStatus());
  });

  return router;
}
