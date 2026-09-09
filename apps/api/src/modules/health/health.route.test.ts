import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../app.js";
import {
  createFakeAccountRepository,
  createFakeSessionRepository,
} from "../auth/test-support/fakes.js";
import { createTestEnv } from "../../test-support/env.js";

const app = createApp({
  env: createTestEnv(),
  accountRepository: createFakeAccountRepository().repository,
  sessionRepository: createFakeSessionRepository().repository,
});

describe("GET /api/health", () => {
  it("zwraca status ok", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("nie jest dostępny poza prefiksem /api", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(404);
  });
});
