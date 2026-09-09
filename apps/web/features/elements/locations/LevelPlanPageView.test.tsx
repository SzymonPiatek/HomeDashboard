import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ locationId: "loc-1", levelId: "lvl-1" }),
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

const useLocationMock = vi.fn();
const useFloorPlanMock = vi.fn();
const deleteLevelMutate = vi.fn();
vi.mock("./api/use-location", () => ({
  useLocation: () => useLocationMock(),
  useUpdateLevel: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useDeleteLevel: () => ({ mutate: deleteLevelMutate, isPending: false, isError: false }),
}));
vi.mock("./api/use-floor-plan", () => ({
  useFloorPlan: () => useFloorPlanMock(),
}));

// Renderer 3D wymaga WebGL, którego jsdom nie ma — na poziomie tej strony
// sprawdzamy tylko, że dostaje właściwy dokument, nie samo renderowanie SVG/3D.
vi.mock("./plan/FloorPlanViewer", () => ({
  FloorPlanViewer: ({ document }: { document: { walls: unknown[]; rooms: unknown[] } }) => (
    <div data-testid="floor-plan-viewer-stub">
      {document.walls.length} ścian, {document.rooms.length} pokoi
    </div>
  ),
}));

import { LevelPlanPageView } from "./LevelPlanPageView";

const LOCATION_WITH_LEVEL = {
  id: "loc-1",
  name: "Mieszkanie",
  levels: [
    { id: "lvl-1", name: "Parter", order: 0 },
    { id: "lvl-2", name: "Piętro", order: 5 },
  ],
};

function renderView() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <LevelPlanPageView />
    </QueryClientProvider>,
  );
}

describe("LevelPlanPageView", () => {
  beforeEach(() => {
    pushMock.mockClear();
    useLocationMock.mockReset();
    useFloorPlanMock.mockReset();
    deleteLevelMutate.mockReset();
    useLocationMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: LOCATION_WITH_LEVEL,
      refetch: vi.fn(),
    });
  });

  it("pokazuje stan ładowania", () => {
    useFloorPlanMock.mockReturnValue({ isPending: true, isError: false, isSuccess: false });

    renderView();

    expect(screen.getByLabelText("Ładowanie poziomu")).toBeInTheDocument();
  });

  it("pokazuje błąd z przyciskiem ponowienia", () => {
    useFloorPlanMock.mockReturnValue({
      isPending: false,
      isError: true,
      isSuccess: false,
      refetch: vi.fn(),
    });

    renderView();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("pokazuje pustą siatkę z komunikatem zamiast błędu, gdy rzut nie jest jeszcze zapisany", () => {
    useFloorPlanMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { version: 0, walls: [], rooms: [] },
    });

    renderView();

    expect(screen.getByText(/Ten poziom nie ma jeszcze zapisanego rzutu/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("pokazuje nazwę poziomu, jego pozycję i przekazuje dokument do renderera", () => {
    useFloorPlanMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { version: 1, walls: [{ id: "w1" }], rooms: [] },
    });

    renderView();

    expect(screen.getByRole("heading", { name: "Parter (1)" })).toBeInTheDocument();
    expect(screen.getByTestId("floor-plan-viewer-stub")).toHaveTextContent("1 ścian, 0 pokoi");
  });

  it("wymaga potwierdzenia przed usunięciem poziomu i przenosi do lokalizacji po sukcesie", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    useFloorPlanMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { version: 0, walls: [], rooms: [] },
    });
    deleteLevelMutate.mockImplementation((_id, options) => options?.onSuccess?.());

    renderView();

    await userEvent.click(screen.getByRole("button", { name: "Usuń poziom „Parter”" }));
    expect(deleteLevelMutate).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Potwierdź usunięcie: poziom „Parter”" }),
    );

    expect(deleteLevelMutate).toHaveBeenCalledWith(
      "lvl-1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(pushMock).toHaveBeenCalledWith("/locations/loc-1");
  });
});
