import type { FloorPlanDocument } from "@repo/contracts/floor-plan";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloorPlanView2D } from "./FloorPlanView2D";

function renderView(document: FloorPlanDocument) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <FloorPlanView2D locationId="loc-1" levelId="lvl-1" document={document} isEditMode={false} />
    </QueryClientProvider>,
  );
}

const DOCUMENT: FloorPlanDocument = {
  version: 1,
  walls: [
    {
      id: "3f9a1c10-1111-4a11-8a11-000000000001",
      points: [
        { xMm: 0, yMm: 0 },
        { xMm: 4000, yMm: 0 },
        { xMm: 4000, yMm: 200 },
        { xMm: 0, yMm: 200 },
      ],
      heightMm: 2500,
    },
  ],
  rooms: [
    {
      id: "9c1f6c1e-2b8b-4b1a-9a3a-7a2b6a2b6a01",
      name: "Salon",
      vertices: [
        { xMm: 200, yMm: 200 },
        { xMm: 3800, yMm: 200 },
        { xMm: 3800, yMm: 3000 },
        { xMm: 200, yMm: 3000 },
      ],
    },
  ],
};

const EMPTY_DOCUMENT: FloorPlanDocument = { version: 0, walls: [], rooms: [] };

describe("FloorPlanView2D", () => {
  it("renderuje ścianę jako element z dostępną nazwą, obsługiwalny klawiaturą", () => {
    renderView(DOCUMENT);

    const wall = screen.getByRole("button", { name: "Ściana 1, 4,00 m × 0,20 m" });
    expect(wall).toBeInTheDocument();
    expect(wall).toHaveAttribute("tabindex", "0");
  });

  it("renderuje pustą siatkę dla dokumentu bez zapisanej geometrii, nie błąd", () => {
    renderView(EMPTY_DOCUMENT);

    const canvas = screen.getByLabelText("Rzut poziomu, widok z góry");
    expect(canvas).toBeInTheDocument();
    expect(within(canvas).queryByRole("button")).not.toBeInTheDocument();
  });
});
