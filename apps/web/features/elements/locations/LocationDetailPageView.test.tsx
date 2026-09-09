import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ locationId: "loc-1" }),
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

const useLocationMock = vi.fn();
const deleteLocationMutate = vi.fn();
const createLevelMutate = vi.fn();
const deleteLevelMutate = vi.fn();
vi.mock("./api/use-location", () => ({
  useLocation: () => useLocationMock(),
  useUpdateLocation: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useDeleteLocation: () => ({ mutate: deleteLocationMutate, isPending: false, isError: false }),
  useCreateLevel: () => ({ mutate: createLevelMutate, isPending: false, isError: false }),
  useUpdateLevel: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useDeleteLevel: () => ({ mutate: deleteLevelMutate, isPending: false, isError: false }),
}));

import { LocationDetailPageView } from "./LocationDetailPageView";

function renderView() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <LocationDetailPageView />
    </QueryClientProvider>,
  );
}

describe("LocationDetailPageView", () => {
  beforeEach(() => {
    pushMock.mockClear();
    useLocationMock.mockReset();
    deleteLocationMutate.mockReset();
    createLevelMutate.mockReset();
    deleteLevelMutate.mockReset();
  });

  it("pokazuje stan ładowania", () => {
    useLocationMock.mockReturnValue({ isPending: true, isError: false });

    renderView();

    expect(screen.getByLabelText("Ładowanie lokalizacji")).toBeInTheDocument();
  });

  it("pokazuje błąd z przyciskiem ponowienia", () => {
    useLocationMock.mockReturnValue({ isPending: false, isError: true, refetch: vi.fn() });

    renderView();

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("pokazuje nazwę i poziomy jako kafelki z numerem liczonym z pozycji na liście", () => {
    useLocationMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: "loc-1",
        name: "Mieszkanie",
        levels: [
          { id: "lvl-2", name: "Piętro", order: 5 },
          { id: "lvl-1", name: "Parter", order: 0 },
        ],
      },
    });

    renderView();

    expect(screen.getByRole("heading", { name: "Mieszkanie" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Parter (1)" })).toHaveAttribute(
      "href",
      "/locations/loc-1/levels/lvl-1",
    );
    expect(screen.getByRole("link", { name: "Piętro (2)" })).toHaveAttribute(
      "href",
      "/locations/loc-1/levels/lvl-2",
    );
  });

  it("wymaga potwierdzenia przed usunięciem lokalizacji i przenosi do listy po sukcesie", async () => {
    useLocationMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: { id: "loc-1", name: "Mieszkanie", levels: [] },
    });
    deleteLocationMutate.mockImplementation((_id, options) => options?.onSuccess?.());

    renderView();

    await userEvent.click(screen.getByRole("button", { name: "Usuń lokalizację „Mieszkanie”" }));
    expect(deleteLocationMutate).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Potwierdź usunięcie: lokalizację „Mieszkanie”" }),
    );

    expect(deleteLocationMutate).toHaveBeenCalledWith(
      "loc-1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(pushMock).toHaveBeenCalledWith("/locations");
  });
});
