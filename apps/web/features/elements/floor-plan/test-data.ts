import type { FloorPlanTestData } from "./types";

// DANE TESTOWE — na sztywno w kodzie na potrzeby spike'a (bez API/bazy, ADR-0002/ADR-0006).
// Salon 4000×3000mm i sypialnia 3000×2500mm, ściany 100–150mm, wysokość 2500mm.
export const FLOOR_PLAN_TEST_DATA: FloorPlanTestData = {
  rooms: [
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a01",
      name: "Salon",
      vertices: [
        { xMm: 0, yMm: 0 },
        { xMm: 4000, yMm: 0 },
        { xMm: 4000, yMm: 3000 },
        { xMm: 0, yMm: 3000 },
      ],
    },
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a02",
      name: "Sypialnia",
      vertices: [
        { xMm: 4100, yMm: 0 },
        { xMm: 7100, yMm: 0 },
        { xMm: 7100, yMm: 2500 },
        { xMm: 4100, yMm: 2500 },
      ],
    },
  ],
  walls: [
    // Salon — ściany zewnętrzne.
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000001",
      startXMm: 0,
      startYMm: 0,
      endXMm: 4000,
      endYMm: 0,
      thicknessMm: 150,
      heightMm: 2500,
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000002",
      startXMm: 0,
      startYMm: 0,
      endXMm: 0,
      endYMm: 3000,
      thicknessMm: 150,
      heightMm: 2500,
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000003",
      startXMm: 0,
      startYMm: 3000,
      endXMm: 4000,
      endYMm: 3000,
      thicknessMm: 150,
      heightMm: 2500,
    },
    // Ściana dzieląca salon i sypialnię.
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000004",
      startXMm: 4050,
      startYMm: 0,
      endXMm: 4050,
      endYMm: 3000,
      thicknessMm: 100,
      heightMm: 2500,
    },
    // Sypialnia — ściany zewnętrzne.
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000005",
      startXMm: 4100,
      startYMm: 0,
      endXMm: 7100,
      endYMm: 0,
      thicknessMm: 150,
      heightMm: 2500,
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000006",
      startXMm: 7100,
      startYMm: 0,
      endXMm: 7100,
      endYMm: 2500,
      thicknessMm: 150,
      heightMm: 2500,
    },
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000007",
      startXMm: 4100,
      startYMm: 2500,
      endXMm: 7100,
      endYMm: 2500,
      thicknessMm: 150,
      heightMm: 2500,
    },
  ],
};
