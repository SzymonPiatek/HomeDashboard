import type { NextFunction, Request, Response } from "express";

import { ApiError, buildErrorBody } from "./api-error.js";
import { readRequestId } from "./request-id.js";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(buildErrorBody("NOT_FOUND", "Nie znaleziono zasobu"));
}

/** Komunikat dla klienta nie ujawnia szczegółów wewnętrznych — .claude/rules/api.md. */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Express: nagłówki już wysłane → oddaj błąd domyślnemu handlerowi, nie odpowiadaj drugi raz.
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json(buildErrorBody(error.code, error.message, error.issues));
    return;
  }

  console.error(
    JSON.stringify({
      level: "error",
      msg: "unhandled request error",
      requestId: readRequestId(res),
      error: error instanceof Error ? error.message : "unknown error",
    }),
  );

  res.status(500).json(buildErrorBody("INTERNAL", "Wystąpił nieoczekiwany błąd"));
}
