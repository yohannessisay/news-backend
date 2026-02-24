import assert from "node:assert/strict";
import { test } from "vitest";
import jwt from "jsonwebtoken";
import { buildApp } from "../app";
import { analyticsModel } from "../api/analytics/analytics.model";
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
  replacement: T[K]
) {
  const original = object[methodName];
  object[methodName] = replacement;

  return () => {
    object[methodName] = original;
  };
}

test("POST /api/v1/analytics/process returns 202", async () => {
  const authorId = "11111111-1111-1111-1111-111111111111";
  const restoreFns = [
    stubMethod(
      analyticsModel,
      "listArticleIdsForDate",
      (async () => [
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      ]) as typeof analyticsModel.listArticleIdsForDate
    ),
    stubMethod(
      analyticsModel,
      "countArticleReadsForDate",
      (async () => 3) as typeof analyticsModel.countArticleReadsForDate
    ),
    stubMethod(
      analyticsModel,
      "upsertDailyAnalyticsRow",
      (async () => undefined) as typeof analyticsModel.upsertDailyAnalyticsRow
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/analytics/process",
      headers: {
        authorization: `Bearer ${buildToken(authorId, "author")}`,
      },
      payload: {
        date: "2026-02-24",
      },
    });

    assert.equal(response.statusCode, 202);
    assert.equal(response.json().Success, true);
    assert.equal(response.json().Object.enqueued, 2);
  } finally {
    await app.close();
    for (const restore of restoreFns.reverse()) {
      restore();
    }
  }
});
