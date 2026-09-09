import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDeleteButton } from "./ConfirmDeleteButton";

describe("ConfirmDeleteButton", () => {
  it("nie usuwa po pierwszym kliknięciu — wymaga jawnego potwierdzenia", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteButton itemLabel="lokalizację „Mieszkanie”" onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: "Usuń lokalizację „Mieszkanie”" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Potwierdź usunięcie: lokalizację „Mieszkanie”" }),
    ).toBeInTheDocument();
  });

  it("wywołuje onConfirm dopiero po potwierdzeniu", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteButton itemLabel="poziom „Parter”" onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: "Usuń poziom „Parter”" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Potwierdź usunięcie: poziom „Parter”" }),
    );

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("pozwala anulować bez wywołania onConfirm", async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteButton itemLabel="poziom „Parter”" onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: "Usuń poziom „Parter”" }));
    await userEvent.click(screen.getByRole("button", { name: "Anuluj" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Usuń poziom „Parter”" })).toBeInTheDocument();
  });
});
