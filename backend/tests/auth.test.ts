import assert from "node:assert/strict";
import { test } from "vitest";
import bcrypt from "bcryptjs";
import { buildApp } from "../app";
import { authModel } from "../api/auth/auth.model";

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

test("POST /api/v1/auth/register returns 201", async () => {
  const userId = "11111111-1111-1111-1111-111111111111";
  const restoreFns = [
    stubMethod(authModel, "findUserByEmail", async () => null),
    stubMethod(
      authModel,
      "createUser",
      async () => ({
        id: userId,
        name: "Test Author",
        email: "test.author@example.com",
        password: "hashed",
        role: "author" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
      })
    ),
    stubMethod(
      authModel,
      "setUserSelfAuditFields",
      async () => null
    ),
    stubMethod(
      authModel,
      "findUserWithAuditById",
      async () => ({
        id: userId,
        name: "Test Author",
        email: "test.author@example.com",
        role: "author" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: { id: userId, name: "Test Author", email: "test.author@example.com" },
        updatedBy: { id: userId, name: "Test Author", email: "test.author@example.com" },
      })
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        name: "Test Author",
        email: "test.author@example.com",
        password: "StrongPass@123",
        role: "author",
      },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.json().Success, true);
  } finally {
    await app.close();
    for (const restore of restoreFns.reverse()) {
      restore();
    }
  }
});

test("POST /api/v1/auth/login returns 200", async () => {
  const userId = "11111111-1111-1111-1111-111111111111";
  const passwordHash = await bcrypt.hash("StrongPass@123", 10);

  const restoreFns = [
    stubMethod(
      authModel,
      "findUserByEmail",
      async () => ({
        id: userId,
        name: "Test Author",
        email: "test.author@example.com",
        password: passwordHash,
        role: "author" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
      })
    ),
    stubMethod(
      authModel,
      "touchUserAudit",
      async () => null
    ),
    stubMethod(
      authModel,
      "findUserWithAuditById",
      async () => ({
        id: userId,
        name: "Test Author",
        email: "test.author@example.com",
        role: "author" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: { id: userId, name: "Test Author", email: "test.author@example.com" },
        updatedBy: { id: userId, name: "Test Author", email: "test.author@example.com" },
      })
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        email: "test.author@example.com",
        password: "StrongPass@123",
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
