import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

const useSessionMock = vi.fn();
vi.mock("@/features/auth/api/use-session", () => ({
  useSession: () => useSessionMock(),
}));

import AppLayout from "./layout";

function renderLayout() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <p>Treść strony</p>
      </AppLayout>
    </QueryClientProvider>,
  );
}

describe("AppLayout", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    useSessionMock.mockReset();
  });

  it("pokazuje treść strony i przycisk wylogowania, gdy sesja jest aktywna", () => {
    useSessionMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { authenticated: true, email: "wlasciciel@example.com" },
      refetch: vi.fn(),
    });

    renderLayout();

    expect(screen.getByText("Treść strony")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wyloguj się" })).toBeInTheDocument();
  });

  it("nie pokazuje treści i przekierowuje do /login, gdy sesja nie jest aktywna", () => {
    useSessionMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { authenticated: false },
      refetch: vi.fn(),
    });

    renderLayout();

    expect(screen.queryByText("Treść strony")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });
});
