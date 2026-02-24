import assert from "node:assert/strict";
import { test } from "vitest";
import jwt from "jsonwebtoken";
import { buildApp } from "../app";
import { analyticsModel } from "../api/analytics/analytics.model";
import { articleModel } from "../api/articles/article.model";
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

test("POST /api/v1/articles returns 201 for author", async () => {
  const authorId = "11111111-1111-1111-1111-111111111111";
  const articleId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  const restoreFns = [
    stubMethod(
      articleModel,
      "createArticle",
      async () => ({
        id: articleId,
        title: "Draft article",
        content:
          "This is a test article body that is intentionally longer than fifty characters.",
        category: "Tech",
        status: "Draft",
        authorId,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: authorId,
        updatedBy: authorId,
      })
    ),
    stubMethod(
      articleModel,
      "findArticleById",
      async () => ({
        id: articleId,
        title: "Draft article",
        content:
          "This is a test article body that is intentionally longer than fifty characters.",
        category: "Tech",
        status: "Draft" as const,
        createdAt: new Date(),
        authorId,
        createdBy: authorId,
        authorName: "Author One",
        deletedAt: null,
      })
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/articles",
      headers: {
        authorization: `Bearer ${buildToken(authorId, "author")}`,
      },
      payload: {
        title: "Draft article",
        content:
          "This is a test article body that is intentionally longer than fifty characters.",
        category: "Tech",
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

test("GET /api/v1/articles/me returns 200 for author", async () => {
  const authorId = "11111111-1111-1111-1111-111111111111";
  const restoreFns = [
    stubMethod(
      articleModel,
      "listAuthorArticles",
      async () => [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          title: "My draft",
          category: "Tech",
          status: "Draft" as const,
          createdAt: new Date(),
          deletedAt: null,
        },
      ]
    ),
    stubMethod(
      articleModel,
      "countAuthorArticles",
      async () => 1
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/articles/me?pageNumber=1&pageSize=10",
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

test("PUT /api/v1/articles/:id returns 403 for non-owner", async () => {
  const authorId = "11111111-1111-1111-1111-111111111111";
  const restore = stubMethod(
    articleModel,
    "findArticleById",
    async () => ({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      title: "Other article",
      content:
        "This is a test article body that is intentionally longer than fifty characters.",
      category: "Tech",
      status: "Draft" as const,
      createdAt: new Date(),
      authorId: "22222222-2222-2222-2222-222222222222",
      createdBy: "22222222-2222-2222-2222-222222222222",
      authorName: "Other Author",
      deletedAt: null,
    })
  );

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/articles/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      headers: {
        authorization: `Bearer ${buildToken(authorId, "author")}`,
      },
      payload: {
        title: "Try edit",
      },
    });

    assert.equal(response.statusCode, 403);
    assert.equal(response.json().Success, false);
  } finally {
    await app.close();
    restore();
  }
});

test("DELETE /api/v1/articles/:id soft deletes owned article", async () => {
  const authorId = "11111111-1111-1111-1111-111111111111";
  const restoreFns = [
    stubMethod(
      articleModel,
      "findArticleById",
      async () => ({
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        title: "Owned article",
        content:
          "This is a test article body that is intentionally longer than fifty characters.",
        category: "Tech",
        status: "Draft" as const,
        createdAt: new Date(),
        authorId,
        createdBy: authorId,
        authorName: "Author One",
        deletedAt: null,
      })
    ),
    stubMethod(
      articleModel,
      "softDeleteAuthorArticle",
      async () => ({
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        deletedAt: new Date(),
      })
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/v1/articles/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
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

test("GET /api/v1/articles returns public paginated feed", async () => {
  const restoreFns = [
    stubMethod(
      articleModel,
      "listPublicArticles",
      async () => [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          title: "Published article",
          category: "Tech",
          status: "Published" as const,
          createdAt: new Date(),
          authorId: "11111111-1111-1111-1111-111111111111",
          authorName: "Author One",
        },
      ]
    ),
    stubMethod(
      articleModel,
      "countPublicArticles",
      async () => 1
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/articles?pageNumber=1&pageSize=10",
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

test("GET /api/v1/articles/reader-feed is reader-only", async () => {
  const readerId = "33333333-3333-3333-3333-333333333333";
  const authorId = "11111111-1111-1111-1111-111111111111";

  const restoreFns = [
    stubMethod(
      articleModel,
      "listPublicArticles",
      async () => [
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          title: "Published article",
          category: "Tech",
          status: "Published" as const,
          createdAt: new Date(),
          authorId,
          authorName: "Author One",
        },
      ]
    ),
    stubMethod(
      articleModel,
      "countPublicArticles",
      async () => 1
    ),
  ];

  const app = await buildApp();
  try {
    const readerResponse = await app.inject({
      method: "GET",
      url: "/api/v1/articles/reader-feed?pageNumber=1&pageSize=10",
      headers: {
        authorization: `Bearer ${buildToken(readerId, "reader")}`,
      },
    });

    const authorResponse = await app.inject({
      method: "GET",
      url: "/api/v1/articles/reader-feed?pageNumber=1&pageSize=10",
      headers: {
        authorization: `Bearer ${buildToken(authorId, "author")}`,
      },
    });

    assert.equal(readerResponse.statusCode, 200);
    assert.equal(authorResponse.statusCode, 403);
  } finally {
    await app.close();
    for (const restore of restoreFns.reverse()) {
      restore();
    }
  }
});

test("GET /api/v1/articles/:id returns detail", async () => {
  const restoreFns = [
    stubMethod(
      articleModel,
      "findArticleById",
      async () => ({
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        title: "Published article",
        content:
          "This is a test article body that is intentionally longer than fifty characters.",
        category: "Tech",
        status: "Published" as const,
        createdAt: new Date(),
        authorId: "11111111-1111-1111-1111-111111111111",
        createdBy: "11111111-1111-1111-1111-111111111111",
        authorName: "Author One",
        deletedAt: null,
      })
    ),
    stubMethod(
      analyticsModel,
      "createReadLogEvent",
      async () => null
    ),
  ];

  const app = await buildApp();
  try {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/articles/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
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

test("GET /api/v1/articles/:id returns 429 after burst reads", async () => {
  const articleId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  const restoreFns = [
    stubMethod(
      articleModel,
      "findArticleById",
      async () => ({
        id: articleId,
        title: "Published article",
        content:
          "This is a test article body that is intentionally longer than fifty characters.",
        category: "Tech",
        status: "Published" as const,
        createdAt: new Date(),
        authorId: "11111111-1111-1111-1111-111111111111",
        createdBy: "11111111-1111-1111-1111-111111111111",
        authorName: "Author One",
        deletedAt: null,
      })
    ),
    stubMethod(
      analyticsModel,
      "createReadLogEvent",
      async () => null
    ),
  ];

  const app = await buildApp();
  try {
    let finalResponse = await app.inject({
      method: "GET",
      url: `/api/v1/articles/${articleId}`,
    });

    for (let index = 0; index < 20; index += 1) {
      finalResponse = await app.inject({
        method: "GET",
        url: `/api/v1/articles/${articleId}`,
      });
    }

    assert.equal(finalResponse.statusCode, 429);
    assert.equal(finalResponse.json().Success, false);
    assert.equal(
      finalResponse.json().Message.includes("Rate limit exceeded"),
      true
    );
  } finally {
    await app.close();
    for (const restore of restoreFns.reverse()) {
      restore();
    }
  }
});
