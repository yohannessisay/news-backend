import assert from "node:assert/strict";
import { test } from "vitest";
import jwt from "jsonwebtoken";
import { buildApp } from "../app";
import { authorModel } from "../api/author/author.model";
import { env } from "../shared/utils/env";

function buildToken(sub: string, role: "author" | "reader", expiresInSeconds = 3600) {
  return jwt.sign({ sub, role }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: expiresInSeconds,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
  });
}

function stubMethod<T extends object, K extends keyof T>(
  object: T,
  methodName: K,
  replacement: unknown
) {
  const original = object[methodName];
  object[methodName] = replacement as T[K];

  return () => {
    object[methodName] = original;
  };
}

test("GET /api/v1/author/dashboard returns paginated data", async () => {
  const authorId = "11111111-1111-1111-1111-111111111111";
  const restoreFns = [
    stubMethod(
      authorModel,
      "listAuthorDashboardRows",
      async () => [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          title: "My article",
          createdAt: new Date(),
          totalViews: 9,
        },
      ]
    ),
    stubMethod(
      authorModel,
      "countAuthorDashboardRows",
      async () => 1
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/author/dashboard?pageNumber=1&pageSize=10",
      headers: {
        authorization: `Bearer ${buildToken(authorId, "author")}`,
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().Success, true);
  } finally {
    await app.close();
    for (const restore of restoreFns.reverse()) {
      restore();
    }
  }
});
