import {
  SQL,
  and,
  desc,
  eq,
  ilike,
  isNull,
  sql,
} from "drizzle-orm";
import { db } from "../../shared/db/client";
import { articles, users } from "../../shared/db/schema";
import {
  ArticleListQuery,
  ArticleStatus,
  CreateArticleBody,
  UpdateArticleBody,
} from "./article.type";

function buildWhereClause(conditions: SQL[]) {
  if (conditions.length === 0) {
    return undefined;
  }

  return and(...conditions);
}

export async function createArticle(input: {
  body: CreateArticleBody;
  authorId: string;
}) {
  const result = await db
    .insert(articles)
    .values({
      title: input.body.title,
      content: input.body.content,
      category: input.body.category,
      status: "Draft",
      authorId: input.authorId,
      createdBy: input.authorId,
      updatedBy: input.authorId,
    })
    .returning();

  return result[0] ?? null;
}

export async function findArticleById(id: string) {
  const result = await db
    .select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
      category: articles.category,
      status: articles.status,
      createdAt: articles.createdAt,
      authorId: articles.authorId,
      createdBy: articles.createdBy,
      authorName: users.name,
      deletedAt: articles.deletedAt,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function updateAuthorArticle(params: {
  id: string;
  authorId: string;
  body: UpdateArticleBody;
}) {
  const updates: {
    title?: string;
    content?: string;
    category?: string;
    status?: ArticleStatus;
    updatedAt: Date;
    updatedBy: string;
  } = {
    updatedAt: new Date(),
    updatedBy: params.authorId,
  };

  if (params.body.title !== undefined) {
    updates.title = params.body.title;
  }
  if (params.body.content !== undefined) {
    updates.content = params.body.content;
  }
  if (params.body.category !== undefined) {
    updates.category = params.body.category;
  }
  if (params.body.status !== undefined) {
    updates.status = params.body.status;
  }

  const result = await db
    .update(articles)
    .set(updates)
    .where(
      and(
        eq(articles.id, params.id),
        eq(articles.createdBy, params.authorId),
        isNull(articles.deletedAt)
      )
    )
    .returning();

  return result[0] ?? null;
}

export async function softDeleteAuthorArticle(id: string, authorId: string) {
  const deletedAt = new Date();
  const result = await db
    .update(articles)
    .set({
      deletedAt,
      updatedAt: deletedAt,
      updatedBy: authorId,
    })
    .where(
      and(
        eq(articles.id, id),
        eq(articles.createdBy, authorId),
        isNull(articles.deletedAt)
      )
    )
    .returning({
      id: articles.id,
      deletedAt: articles.deletedAt,
    });

  return result[0] ?? null;
}

export async function listPublicArticles(params: {
  filters: ArticleListQuery;
  pageSize: number;
  offset: number;
}) {
  const conditions: SQL[] = [
    eq(articles.status, "Published"),
    isNull(articles.deletedAt),
  ];

  if (params.filters.category) {
    conditions.push(eq(articles.category, params.filters.category));
  }
  if (params.filters.author) {
    conditions.push(ilike(users.name, `%${params.filters.author}%`));
  }
  if (params.filters.q) {
    conditions.push(ilike(articles.title, `%${params.filters.q}%`));
  }

  return db
    .select({
      id: articles.id,
      title: articles.title,
      category: articles.category,
      status: articles.status,
      createdAt: articles.createdAt,
      authorId: articles.authorId,
      authorName: users.name,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(buildWhereClause(conditions))
    .orderBy(desc(articles.createdAt))
    .limit(params.pageSize)
    .offset(params.offset);
}

export async function countPublicArticles(filters: ArticleListQuery) {
  const conditions: SQL[] = [
    eq(articles.status, "Published"),
    isNull(articles.deletedAt),
  ];

  if (filters.category) {
    conditions.push(eq(articles.category, filters.category));
  }
  if (filters.author) {
    conditions.push(ilike(users.name, `%${filters.author}%`));
  }
  if (filters.q) {
    conditions.push(ilike(articles.title, `%${filters.q}%`));
  }

  const result = await db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(buildWhereClause(conditions));

  return Number(result[0]?.total ?? 0);
}

export async function listAuthorArticles(params: {
  authorId: string;
  includeDeleted: boolean;
  pageSize: number;
  offset: number;
}) {
  const conditions: SQL[] = [eq(articles.authorId, params.authorId)];

  if (!params.includeDeleted) {
    conditions.push(isNull(articles.deletedAt));
  }

  return db
    .select({
      id: articles.id,
      title: articles.title,
      category: articles.category,
      status: articles.status,
      createdAt: articles.createdAt,
      deletedAt: articles.deletedAt,
    })
    .from(articles)
    .where(buildWhereClause(conditions))
    .orderBy(desc(articles.createdAt))
    .limit(params.pageSize)
    .offset(params.offset);
}

export async function countAuthorArticles(authorId: string, includeDeleted: boolean) {
  const conditions: SQL[] = [eq(articles.authorId, authorId)];
  if (!includeDeleted) {
    conditions.push(isNull(articles.deletedAt));
  }

  const result = await db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(articles)
    .where(buildWhereClause(conditions));

  return Number(result[0]?.total ?? 0);
}

export const articleModel = {
  createArticle,
  findArticleById,
  updateAuthorArticle,
  softDeleteAuthorArticle,
  listPublicArticles,
  countPublicArticles,
  listAuthorArticles,
  countAuthorArticles,
};
