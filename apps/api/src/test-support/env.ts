import type { Env } from "../config/env.js";

/** Konfiguracja testowa — nie łączy się z realną bazą ani z Google. */
export function createTestEnv(overrides: Partial<Env> = {}): Env {
  return {
    DATABASE_URL: "postgresql://test:test@localhost:5433/test",
    PORT: 4000,
    GOOGLE_CLIENT_ID: "test-client-id",
    GOOGLE_CLIENT_SECRET: "test-client-secret",
    GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
    OWNER_EMAIL: "owner@example.com",
    SESSION_TTL_KIOSK_DAYS: 180,
    SESSION_TTL_STANDARD_DAYS: 7,
    COOKIE_SECURE: false,
    ...overrides,
  };
}
