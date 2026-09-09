import { describe, expect, it } from "vitest";

import { apiErrorSchema } from "../src/error.js";

describe("apiErrorSchema", () => {
  it("przyjmuje błąd bez szczegółów walidacji", () => {
    const parsed = apiErrorSchema.parse({
      error: { code: "NOT_FOUND", message: "Nie znaleziono zasobu" },
    });

    expect(parsed.error.issues).toBeUndefined();
  });

  it("przyjmuje błąd walidacji ze szczegółami per pole", () => {
    const parsed = apiErrorSchema.parse({
      error: {
        code: "VALIDATION_FAILED",
        message: "Nieprawidłowe dane",
        issues: [{ path: "email", message: "Wymagane" }],
      },
    });

    expect(parsed.error.issues).toEqual([{ path: "email", message: "Wymagane" }]);
  });

  it("odrzuca kod błędu spoza zamkniętej listy", () => {
    const result = apiErrorSchema.safeParse({
      error: { code: "TEAPOT", message: "Nie ten kod" },
    });

    expect(result.success).toBe(false);
  });

  it("odrzuca odpowiedź bez komunikatu", () => {
    const result = apiErrorSchema.safeParse({ error: { code: "INTERNAL" } });

    expect(result.success).toBe(false);
  });
});
