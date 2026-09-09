import type { FloorPlanTestData } from "./types";

export const FLOOR_PLAN_TEST_DATA: FloorPlanTestData = {
  rooms: [
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a01",
      name: "Hol",
      vertices: [
        { xMm: 200, yMm: 200 },
        { xMm: 1400, yMm: 200 },
        { xMm: 1400, yMm: 5700 },
        { xMm: 200, yMm: 5700 },
      ],
    },
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a02",
      name: "Łazienka",
      vertices: [
        { xMm: 1500, yMm: 200 },
        { xMm: 3500, yMm: 200 },
        { xMm: 3500, yMm: 2700 },
        { xMm: 1500, yMm: 2700 },
      ],
    },
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a03",
      name: "Sypialnia",
      vertices: [
        { xMm: 3600, yMm: 200 },
        { xMm: 8400, yMm: 200 },
        { xMm: 8400, yMm: 2700 },
        { xMm: 3600, yMm: 2700 },
      ],
    },
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a04",
      name: "Salon z kuchnią",
      vertices: [
        { xMm: 1500, yMm: 2800 },
        { xMm: 7500, yMm: 2800 },
        { xMm: 7500, yMm: 5700 },
        { xMm: 1500, yMm: 5700 },
      ],
    },
  ],
  walls: [
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000001",
      points: [
        { xMm: 0, yMm: 0 },
        { xMm: 8600, yMm: 0 },
        { xMm: 8600, yMm: 200 },
        { xMm: 0, yMm: 200 },
      ],
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000002",
      points: [
        { xMm: 0, yMm: 0 },
        { xMm: 200, yMm: 0 },
        { xMm: 200, yMm: 5900 },
        { xMm: 0, yMm: 5900 },
      ],
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000003",
      points: [
        { xMm: 0, yMm: 5700 },
        { xMm: 7700, yMm: 5700 },
        { xMm: 7700, yMm: 5900 },
        { xMm: 0, yMm: 5900 },
      ],
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000004",
      points: [
        { xMm: 8400, yMm: 0 },
        { xMm: 8600, yMm: 0 },
        { xMm: 8600, yMm: 2900 },
        { xMm: 8400, yMm: 2900 },
      ],
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000005",
      points: [
        { xMm: 7500, yMm: 2700 },
        { xMm: 7700, yMm: 2700 },
        { xMm: 7700, yMm: 5900 },
        { xMm: 7500, yMm: 5900 },
      ],
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000006",
      points: [
        { xMm: 7700, yMm: 2700 },
        { xMm: 8600, yMm: 2700 },
        { xMm: 8600, yMm: 2900 },
        { xMm: 7700, yMm: 2900 },
      ],
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000007",
      points: [
        { xMm: 1400, yMm: 0 },
        { xMm: 1500, yMm: 0 },
        { xMm: 1500, yMm: 5900 },
        { xMm: 1400, yMm: 5900 },
      ],
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000008",
      points: [
        { xMm: 3500, yMm: 200 },
        { xMm: 3600, yMm: 200 },
        { xMm: 3600, yMm: 2700 },
        { xMm: 3500, yMm: 2700 },
      ],
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000009",
      points: [
        { xMm: 1500, yMm: 2700 },
        { xMm: 7500, yMm: 2700 },
        { xMm: 7500, yMm: 2800 },
        { xMm: 1500, yMm: 2800 },
      ],
    },
  ],
};
