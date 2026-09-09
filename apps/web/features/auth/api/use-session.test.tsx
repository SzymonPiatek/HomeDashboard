import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSession } from "./use-session";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useSession", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("zwraca stan niezalogowany, gdy API odpowiada authenticated: false", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ authenticated: false }), { status: 200 }),
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ authenticated: false });
  });

  it("zwraca adres e-mail, gdy API odpowiada authenticated: true", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ authenticated: true, email: "wlasciciel@example.com" }), {
        status: 200,
      }),
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      authenticated: true,
      email: "wlasciciel@example.com",
    });
  });

  it("kończy się błędem, gdy odpowiedź nie ma statusu 2xx", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("kończy się błędem, gdy odpowiedź nie jest zgodna z kontraktem", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ authenticated: "tak" }), { status: 200 }),
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
