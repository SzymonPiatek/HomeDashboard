import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

const useSessionMock = vi.fn();
vi.mock("../api/use-session", () => ({
  useSession: () => useSessionMock(),
}));

// vi.mock jest podnoszony ponad importy, więc AuthGate dostaje zamockowany hook
// sesji zamiast wywoływać prawdziwy fetch/kontrakt.
import { AuthGate } from "./AuthGate";

function renderGate(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("AuthGate", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    useSessionMock.mockReset();
  });

  it("pokazuje wskaźnik ładowania z dostępną nazwą, gdy sesja się wczytuje", () => {
    useSessionMock.mockReturnValue({
      isPending: true,
      isError: false,
      isSuccess: false,
      data: undefined,
      refetch: vi.fn(),
    });

    renderGate(
      <AuthGate>
        <p>Treść pulpitu</p>
      </AuthGate>,
    );

    expect(screen.getByRole("status")).toHaveAccessibleName("Sprawdzanie sesji…");
    expect(screen.queryByText("Treść pulpitu")).not.toBeInTheDocument();
  });

  it("pokazuje komunikat błędu i pozwala ponowić próbę, gdy pobranie sesji się nie powiedzie", async () => {
    const refetch = vi.fn();
    useSessionMock.mockReturnValue({
      isPending: false,
      isError: true,
      isSuccess: false,
      data: undefined,
      refetch,
    });

    renderGate(
      <AuthGate>
        <p>Treść pulpitu</p>
      </AuthGate>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Nie udało się sprawdzić sesji");

    await userEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("przekierowuje do /login i nie renderuje treści, gdy użytkownik nie jest zalogowany", () => {
    useSessionMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { authenticated: false },
      refetch: vi.fn(),
    });

    renderGate(
      <AuthGate>
        <p>Treść pulpitu</p>
      </AuthGate>,
    );

    expect(replaceMock).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Treść pulpitu")).not.toBeInTheDocument();
  });

  it("renderuje treść aplikacji, gdy użytkownik jest zalogowany", () => {
    useSessionMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { authenticated: true, email: "wlasciciel@example.com" },
      refetch: vi.fn(),
    });

    renderGate(
      <AuthGate>
        <p>Treść pulpitu</p>
      </AuthGate>,
    );

    expect(screen.getByText("Treść pulpitu")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
