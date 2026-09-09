import { apiErrorSchema } from "@repo/contracts/error";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "./app.js";
import {
  createFakeAccountRepository,
  createFakeSessionRepository,
} from "./modules/auth/test-support/fakes.js";
import { createTestEnv } from "./test-support/env.js";

const app = createApp({
  env: createTestEnv(),
  accountRepository: createFakeAccountRepository().repository,
  sessionRepository: createFakeSessionRepository().repository,
});

describe("createApp", () => {
  it("odpowiada na nieznaną ścieżkę wspólnym kształtem błędu z kontraktu", async () => {
    const response = await request(app).get("/api/nie-istnieje");

    expect(response.status).toBe(404);
    expect(apiErrorSchema.parse(response.body).error.code).toBe("NOT_FOUND");
  });

  it("zwraca identyfikator korelacji, gdy klient go nie przysłał", async () => {
    const response = await request(app).get("/api/health");

    expect(response.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("odsyła identyfikator korelacji przysłany przez klienta", async () => {
    const response = await request(app).get("/api/health").set("x-request-id", "req-123");

    expect(response.headers["x-request-id"]).toBe("req-123");
  });
});
