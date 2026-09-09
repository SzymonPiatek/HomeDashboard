import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoginPage from "./page";

describe("LoginPage", () => {
  it("udostępnia logowanie standardowe jako nawigację do endpointu Google", async () => {
    const ui = await LoginPage({ searchParams: Promise.resolve({}) });
    render(ui);

    const standardLink = screen.getByRole("link", { name: "Zaloguj się kontem Google" });
    expect(standardLink).toHaveAttribute("href", "/api/auth/google/start?device=standard");
  });

  it("udostępnia logowanie kioskowe jako osobną nawigację z device=kiosk", async () => {
    const ui = await LoginPage({ searchParams: Promise.resolve({}) });
    render(ui);

    const kioskLink = screen.getByRole("link", { name: "Zapamiętaj to urządzenie" });
    expect(kioskLink).toHaveAttribute("href", "/api/auth/google/start?device=kiosk");
  });

  it("nie pokazuje komunikatu błędu, gdy adres nie zawiera parametru error", async () => {
    const ui = await LoginPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("pokazuje jeden ogólny komunikat odmowy, niezależnie od przyczyny w parametrze error", async () => {
    const ui = await LoginPage({ searchParams: Promise.resolve({ error: "access_denied" }) });
    render(ui);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nie udało się zalogować. Ten adres nie ma dostępu do aplikacji.",
    );
  });
});
