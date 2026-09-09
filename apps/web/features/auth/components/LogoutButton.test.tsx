import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
}));

import { LogoutButton } from "./LogoutButton";

function renderButton() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <LogoutButton />
    </QueryClientProvider>,
  );
}

describe("LogoutButton", () => {
  beforeEach(() => {
    pushMock.mockClear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ma dostępną nazwę i wywołuje wylogowanie żądaniem POST po kliknięciu", async () => {
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: "Wyloguj się" }));

    expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
  });

  it("po udanym wylogowaniu przenosi użytkownika na /login", async () => {
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: "Wyloguj się" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
  });

  it("wyłącza przycisk w trakcie wylogowywania, żeby nie wysłać drugiego żądania", async () => {
    let resolveFetch: (() => void) | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = () => resolve(new Response(null, { status: 204 }));
          }),
      ),
    );

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Wyloguj się" }));

    expect(screen.getByRole("button", { name: "Wylogowywanie…" })).toBeDisabled();

    resolveFetch?.();
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
  });

  it("gdy wylogowanie zwróci błąd, i tak przenosi na /login i pokazuje komunikat", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    renderButton();
    await userEvent.click(screen.getByRole("button", { name: "Wyloguj się" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Sesja wygasła. Trwa przekierowanie do logowania…",
    );
  });
});
