import type { NextFunction, Request, Response } from "express";

/**
 * Ręczny parser nagłówka Cookie zamiast biblioteki `cookie-parser` — wartości
 * przychodzące od klienta są tylko odczytywane, wysyłane wyłącznie przez
 * `res.cookie`/`res.clearCookie` Express (ADR-0001: bez nowych zależności auth).
 */
export function parseCookieHeader(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;

    const name = part.slice(0, separatorIndex).trim();
    const rawValue = part.slice(separatorIndex + 1).trim();
    if (!name) continue;

    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }
  }

  return cookies;
}

export function cookies(req: Request, _res: Response, next: NextFunction): void {
  req.cookies = parseCookieHeader(req.headers.cookie);
  next();
}
