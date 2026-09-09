import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

export const REQUEST_ID_HEADER = "x-request-id";

/** Identyfikator korelacji żądania — wymóg logów w .claude/rules/ops.md. */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(REQUEST_ID_HEADER);
  const id = incoming && incoming.length <= 200 ? incoming : randomUUID();

  res.setHeader(REQUEST_ID_HEADER, id);
  next();
}

export function readRequestId(res: Response): string {
  const header = res.getHeader(REQUEST_ID_HEADER);
  return typeof header === "string" ? header : "unknown";
}
