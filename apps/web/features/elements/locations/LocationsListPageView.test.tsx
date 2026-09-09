import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useLocationsMock = vi.fn();
const createLocationMutate = vi.fn();
vi.mock("./api/use-locations", () => ({
  useLocations: () => useLocationsMock(),
  useCreateLocation: () => ({ mutate: createLocationMutate, isPending: false, isError: false }),
}));

import { LocationsListPageView } from "./LocationsListPageView";

function renderView() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <LocationsListPageView />
    </QueryClientProvider>,
  );
}

describe("LocationsListPageView", () => {
  beforeEach(() => {
    useLocationsMock.mockReset();
    createLocationMutate.mockReset();
  });

  it("pokazuje stan ładowania", () => {
    useLocationsMock.mockReturnValue({ isPending: true, isError: false, isSuccess: false });

    renderView();

    expect(screen.getByLabelText("Ładowanie lokalizacji")).toBeInTheDocument();
  });

  it("pokazuje błąd z przyciskiem ponowienia", () => {
    const refetch = vi.fn();
    useLocationsMock.mockReturnValue({
      isPending: false,
      isError: true,
      isSuccess: false,
      refetch,
    });

    renderView();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Spróbuj ponownie" })).toBeInTheDocument();
  });

  it("pokazuje stan pusty z jedną akcją dodania", () => {
    useLocationsMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { pages: [{ items: [], nextCursor: null }] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    renderView();

    expect(
      screen.getByText("Nie masz jeszcze żadnej lokalizacji. Dodaj pierwszą powyżej."),
    ).toBeInTheDocument();
  });

  it("pokazuje listę lokalizacji jako linki do szczegółów", () => {
    useLocationsMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        pages: [
          {
            items: [
              {
                id: "loc-1",
                name: "Mieszkanie",
                levelCount: 0,
                createdAt: "2026-01-01T00:00:00.000Z",
              },
            ],
            nextCursor: null,
          },
        ],
      },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    renderView();

    expect(screen.getByRole("link", { name: "Mieszkanie" })).toHaveAttribute(
      "href",
      "/locations/loc-1",
    );
  });

  it("wysyła nazwę nowej lokalizacji po zatwierdzeniu formularza", async () => {
    useLocationsMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { pages: [{ items: [], nextCursor: null }] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    renderView();

    await userEvent.type(screen.getByLabelText("Nazwa lokalizacji"), "Mieszkanie");
    await userEvent.click(screen.getByRole("button", { name: "Dodaj lokalizację" }));

    expect(createLocationMutate).toHaveBeenCalledWith(
      { name: "Mieszkanie" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
