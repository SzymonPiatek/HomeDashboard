import { describe, expect, it } from "vitest";

import { authSessionSchema } from "../src/auth.js";

describe("authSessionSchema", () => {
  it("przyjmuje sesję uwierzytelnioną z adresem e-mail", () => {
    const parsed = authSessionSchema.parse({
      authenticated: true,
      email: "owner@example.com",
    });

    expect(parsed).toEqual({ authenticated: true, email: "owner@example.com" });
  });

  it("przyjmuje brak sesji bez adresu e-mail", () => {
    const parsed = authSessionSchema.parse({ authenticated: false });

    expect(parsed).toEqual({ authenticated: false });
  });

  it("odrzuca sesję uwierzytelnioną bez adresu e-mail", () => {
    const result = authSessionSchema.safeParse({ authenticated: true });

    expect(result.success).toBe(false);
  });

  it("odrzuca adres e-mail w nieprawidłowym formacie", () => {
    const result = authSessionSchema.safeParse({ authenticated: true, email: "not-an-email" });

    expect(result.success).toBe(false);
  });
});
