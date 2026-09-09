import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "@/lib/theme";

import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  it("pokazuje etykietę włączenia trybu ciemnego, gdy motyw jest jasny", async () => {
    render(<ThemeToggle />);

    expect(await screen.findByRole("button", { name: "Tryb ciemny" })).toBeInTheDocument();
  });

  it("po kliknięciu dodaje klasę dark do <html> i zapamiętuje wybór", async () => {
    render(<ThemeToggle />);

    await userEvent.click(await screen.findByRole("button", { name: "Tryb ciemny" }));

    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(true));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "Tryb jasny" })).toBeInTheDocument();
  });

  it("kliknięte ponownie zdejmuje klasę dark i zapamiętuje jasny motyw", async () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);

    await userEvent.click(await screen.findByRole("button", { name: "Tryb jasny" }));

    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(false));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
