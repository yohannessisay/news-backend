import assert from "node:assert/strict";
import { test } from "vitest";
import { buildApp } from "../app";

test("GET /api/v1/health returns 200", async () => {
  const app = await buildApp();

  try {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/health",
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().Success, true);
  } finally {
    await app.close();
  }
});
