import { describe, expect, it } from "vitest";

import {
  createLevelBodySchema,
  createLocationBodySchema,
  levelParamsSchema,
  locationParamsSchema,
  NAME_MAX_LENGTH,
} from "../src/locations.js";

describe("locationParamsSchema / levelParamsSchema", () => {
  it("wymaga locationId w ścieżce poziomu, mimo że levelId jest unikalny", () => {
    const result = levelParamsSchema.safeParse({ levelId: "level-1" });

    expect(result.success).toBe(false);
  });

  it("przyjmuje pełny łańcuch identyfikatorów", () => {
    const parsed = levelParamsSchema.parse({ locationId: "loc-1", levelId: "level-1" });

    expect(parsed).toEqual({ locationId: "loc-1", levelId: "level-1" });
  });

  it("odrzuca pusty locationId", () => {
    const result = locationParamsSchema.safeParse({ locationId: "" });

    expect(result.success).toBe(false);
  });
});

describe("createLocationBodySchema", () => {
  it("przycina białe znaki wokół nazwy", () => {
    const parsed = createLocationBodySchema.parse({ name: "  Mieszkanie  " });

    expect(parsed.name).toBe("Mieszkanie");
  });

  it("odrzuca pustą nazwę", () => {
    const result = createLocationBodySchema.safeParse({ name: "   " });

    expect(result.success).toBe(false);
  });

  it(`odrzuca nazwę dłuższą niż ${NAME_MAX_LENGTH} znaków`, () => {
    const result = createLocationBodySchema.safeParse({ name: "a".repeat(NAME_MAX_LENGTH + 1) });

    expect(result.success).toBe(false);
  });

  it("nie ma pola order w wejściu tworzenia poziomu", () => {
    const parsed = createLevelBodySchema.parse({ name: "Parter", order: 99 });

    expect(parsed).not.toHaveProperty("order");
  });
});
