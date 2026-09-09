import { describe, expect, it } from "vitest";

import { readEnv } from "./env.js";

const DATABASE_URL = "postgresql://user:pass@localhost:5433/app";

const VALID_ENV = {
  DATABASE_URL,
  GOOGLE_CLIENT_ID: "client-id",
  GOOGLE_CLIENT_SECRET: "client-secret",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
  OWNER_EMAIL: "owner@example.com",
  COOKIE_SECURE: "false",
};

describe("readEnv", () => {
  it("zatrzymuje start, gdy brakuje DATABASE_URL", () => {
    expect(() => readEnv({ ...VALID_ENV, DATABASE_URL: undefined })).toThrowError(/DATABASE_URL/);
  });

  it("nie ujawnia wartości zmiennych w komunikacie błędu", () => {
    expect(() => readEnv({ ...VALID_ENV, PORT: "0" })).toThrowError(
      expect.not.stringContaining(DATABASE_URL),
    );
  });

  it("odrzuca PORT spoza zakresu portów TCP", () => {
    expect(() => readEnv({ ...VALID_ENV, PORT: "70000" })).toThrowError(/PORT/);
  });

  it("zamienia PORT na liczbę", () => {
    expect(readEnv({ ...VALID_ENV, PORT: "4100" }).PORT).toBe(4100);
  });

  it("używa portu 4000, gdy PORT nie jest podany", () => {
    expect(readEnv(VALID_ENV).PORT).toBe(4000);
  });

  it("zatrzymuje start, gdy brakuje poświadczeń Google", () => {
    expect(() => readEnv({ ...VALID_ENV, GOOGLE_CLIENT_ID: undefined })).toThrowError(
      /GOOGLE_CLIENT_ID/,
    );
  });

  it("odrzuca OWNER_EMAIL w nieprawidłowym formacie", () => {
    expect(() => readEnv({ ...VALID_ENV, OWNER_EMAIL: "not-an-email" })).toThrowError(
      /OWNER_EMAIL/,
    );
  });

  it("domyślnie ustawia czasy życia sesji z ADR-0003", () => {
    const env = readEnv(VALID_ENV);

    expect(env.SESSION_TTL_KIOSK_DAYS).toBe(180);
    expect(env.SESSION_TTL_STANDARD_DAYS).toBe(7);
  });

  it("pozwala nadpisać czasy życia sesji", () => {
    const env = readEnv({
      ...VALID_ENV,
      SESSION_TTL_KIOSK_DAYS: "30",
      SESSION_TTL_STANDARD_DAYS: "1",
    });

    expect(env.SESSION_TTL_KIOSK_DAYS).toBe(30);
    expect(env.SESSION_TTL_STANDARD_DAYS).toBe(1);
  });

  it("zatrzymuje start, gdy brakuje COOKIE_SECURE", () => {
    expect(() => readEnv({ ...VALID_ENV, COOKIE_SECURE: undefined })).toThrowError(/COOKIE_SECURE/);
  });

  it("włącza COOKIE_SECURE wyłącznie dla wartości 'true'", () => {
    expect(readEnv({ ...VALID_ENV, COOKIE_SECURE: "true" }).COOKIE_SECURE).toBe(true);
  });

  it("odrzuca COOKIE_SECURE spoza zamkniętej listy true/false", () => {
    expect(() => readEnv({ ...VALID_ENV, COOKIE_SECURE: "yes" })).toThrowError(/COOKIE_SECURE/);
  });
});
