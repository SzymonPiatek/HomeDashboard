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

import DashboardPage from "./page";

function renderPage() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    useSessionMock.mockReset();
  });

  it("pokazuje pulpit i przycisk wylogowania, gdy sesja jest aktywna", () => {
    useSessionMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { authenticated: true, email: "wlasciciel@example.com" },
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByRole("heading", { name: "Pulpit domowy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wyloguj się" })).toBeInTheDocument();
  });

  it("nie pokazuje pulpitu i przekierowuje do /login, gdy sesja nie jest aktywna", () => {
    useSessionMock.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { authenticated: false },
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.queryByRole("heading", { name: "Pulpit domowy" })).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });
});
