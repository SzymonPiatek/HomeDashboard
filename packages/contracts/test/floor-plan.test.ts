import { describe, expect, it } from "vitest";

import {
  DEFAULT_WALL_HEIGHT_MM,
  floorPlanDocumentSchema,
  MAX_COORDINATE_MM,
  MAX_ROOM_VERTICES,
  MIN_ROOM_VERTICES,
  roomSchema,
  wallSchema,
} from "../src/floor-plan.js";

const point = { xMm: 0, yMm: 0 };

describe("wallSchema", () => {
  it("wymaga dokładnie czterech punktów, nie mniej i nie więcej", () => {
    const result = wallSchema.safeParse({
      id: "3f6f6f6f-6f6f-4f6f-8f6f-6f6f6f6f6f6f",
      points: [point, point, point],
      heightMm: 2500,
    });

    expect(result.success).toBe(false);
  });

  it("stosuje domyślną wysokość, gdy klient jej nie poda", () => {
    const parsed = wallSchema.parse({
      id: "3f6f6f6f-6f6f-4f6f-8f6f-6f6f6f6f6f6f",
      points: [point, point, point, point],
    });

    expect(parsed.heightMm).toBe(DEFAULT_WALL_HEIGHT_MM);
  });

  it("odrzuca współrzędną poza zakresem -100000..100000 mm", () => {
    const result = wallSchema.safeParse({
      id: "3f6f6f6f-6f6f-4f6f-8f6f-6f6f6f6f6f6f",
      points: [{ xMm: MAX_COORDINATE_MM + 1, yMm: 0 }, point, point, point],
      heightMm: 2500,
    });

    expect(result.success).toBe(false);
  });

  it("odrzuca identyfikator, który nie jest uuid", () => {
    const result = wallSchema.safeParse({
      id: "not-a-uuid",
      points: [point, point, point, point],
      heightMm: 2500,
    });

    expect(result.success).toBe(false);
  });
});

describe("roomSchema", () => {
  it(`odrzuca pokój z mniej niż ${MIN_ROOM_VERTICES} wierzchołkami`, () => {
    const result = roomSchema.safeParse({
      id: "3f6f6f6f-6f6f-4f6f-8f6f-6f6f6f6f6f6f",
      name: "Salon",
      vertices: [point, point],
    });

    expect(result.success).toBe(false);
  });

  it(`odrzuca pokój z więcej niż ${MAX_ROOM_VERTICES} wierzchołkami`, () => {
    const result = roomSchema.safeParse({
      id: "3f6f6f6f-6f6f-4f6f-8f6f-6f6f6f6f6f6f",
      name: "Salon",
      vertices: Array.from({ length: MAX_ROOM_VERTICES + 1 }, () => point),
    });

    expect(result.success).toBe(false);
  });
});

describe("floorPlanDocumentSchema", () => {
  it("przyjmuje pusty dokument jako stan poprawny (poziom bez rzutu)", () => {
    const parsed = floorPlanDocumentSchema.parse({ version: 0, walls: [], rooms: [] });

    expect(parsed).toEqual({ version: 0, walls: [], rooms: [] });
  });
});
