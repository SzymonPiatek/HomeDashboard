import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("pokazuje kafelek Lokalizacje", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { name: "Pulpit domowy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lokalizacje" })).toHaveAttribute(
      "href",
      "/locations",
    );
  });
});
