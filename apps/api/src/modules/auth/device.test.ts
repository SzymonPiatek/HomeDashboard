import { describe, expect, it } from "vitest";

import { startQuerySchema } from "./device.js";

describe("startQuerySchema", () => {
  it("przyjmuje device=kiosk", () => {
    expect(startQuerySchema.safeParse({ device: "kiosk" }).success).toBe(true);
  });

  it("przyjmuje device=standard", () => {
    expect(startQuerySchema.safeParse({ device: "standard" }).success).toBe(true);
  });

  it("odrzuca wartość spoza zamkniętej listy", () => {
    expect(startQuerySchema.safeParse({ device: "laptop" }).success).toBe(false);
  });

  it("odrzuca brak parametru device", () => {
    expect(startQuerySchema.safeParse({}).success).toBe(false);
  });
});
