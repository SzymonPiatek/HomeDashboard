import type { FloorPlanTestData } from "./types";

export const FLOOR_PLAN_TEST_DATA: FloorPlanTestData = {
  rooms: [
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a01",
      name: "Pokój",
      vertices: [
        { xMm: 200, yMm: 200 },
        { xMm: 1200, yMm: 200 },
        { xMm: 1200, yMm: 2200 },
        { xMm: 200, yMm: 2200 },
      ],
    },
  ],
  walls: [
    // Góra — pełna szerokość zewnętrzna.
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000001",
      points: [
        { xMm: 0, yMm: 0 },
        { xMm: 1400, yMm: 0 },
        { xMm: 1400, yMm: 200 },
        { xMm: 0, yMm: 200 },
      ],
    },
    // Prawa — mieści się między górną a dolną ścianą.
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000002",
      points: [
        { xMm: 1200, yMm: 200 },
        { xMm: 1400, yMm: 200 },
        { xMm: 1400, yMm: 2200 },
        { xMm: 1200, yMm: 2200 },
      ],
    },
    // Lewa — mieści się między górną a dolną ścianą.
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000003",
      points: [
        { xMm: 0, yMm: 200 },
        { xMm: 200, yMm: 200 },
        { xMm: 200, yMm: 2200 },
        { xMm: 0, yMm: 2200 },
      ],
    },
    // Dół — pełna szerokość zewnętrzna.
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000004",
      points: [
        { xMm: 0, yMm: 2200 },
        { xMm: 1400, yMm: 2200 },
        { xMm: 1400, yMm: 2400 },
        { xMm: 0, yMm: 2400 },
      ],
    },
  ],
};
