import type { Request } from "express";

import { ApiError } from "../../http/api-error.js";

/**
 * `accountId` wyłącznie z sesji, nigdy z ciała żądania (.claude/rules/api.md).
 * `req.auth` jest gwarantowany przez `requireSession` zamontowany w app.ts przed
 * tym routerem; rzut 401 tutaj jest siecią bezpieczeństwa, nie ścieżką normalną.
 */
export function getAccountId(req: Request): string {
  if (!req.auth) throw new ApiError(401, "UNAUTHENTICATED", "Wymagane zalogowanie");
  return req.auth.accountId;
}
