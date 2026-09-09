import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  paginatedResponseSchema,
  paginationQuerySchema,
} from "../src/pagination.js";

describe("paginationQuerySchema", () => {
  it("stosuje domyślny rozmiar strony, gdy klient nic nie poda", () => {
    const parsed = paginationQuerySchema.parse({});

    expect(parsed.limit).toBe(DEFAULT_PAGE_SIZE);
    expect(parsed.cursor).toBeUndefined();
  });

  it("koerciuje limit z query stringa", () => {
    const parsed = paginationQuerySchema.parse({ limit: "25" });

    expect(parsed.limit).toBe(25);
  });

  it("odrzuca limit powyżej twardego limitu serwera", () => {
    const result = paginationQuerySchema.safeParse({ limit: String(MAX_PAGE_SIZE + 1) });

    expect(result.success).toBe(false);
  });

  it("odrzuca limit poniżej jednego", () => {
    const result = paginationQuerySchema.safeParse({ limit: "0" });

    expect(result.success).toBe(false);
  });
});

describe("paginatedResponseSchema", () => {
  it("waliduje items i nextCursor", () => {
    const schema = paginatedResponseSchema(z.string());
    const parsed = schema.parse({ items: ["a", "b"], nextCursor: null });

    expect(parsed.nextCursor).toBeNull();
    expect(parsed.items).toEqual(["a", "b"]);
  });

  it("odrzuca nextCursor undefined — pole musi być jawnym null", () => {
    const schema = paginatedResponseSchema(z.string());
    const result = schema.safeParse({ items: [] });

    expect(result.success).toBe(false);
  });
});
