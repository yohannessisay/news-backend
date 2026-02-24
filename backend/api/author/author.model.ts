import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../shared/db/client";
import { articles, dailyAnalytics } from "../../shared/db/schema";

export async function listAuthorDashboardRows(params: {
  authorId: string;
  pageSize: number;
  offset: number;
}) {
  return db
    .select({
      id: articles.id,
      title: articles.title,
      createdAt: articles.createdAt,
      totalViews: sql<number>`coalesce(sum(${dailyAnalytics.viewCount}), 0)::int`,
    })
    .from(articles)
    .leftJoin(dailyAnalytics, eq(dailyAnalytics.articleId, articles.id))
    .where(and(eq(articles.authorId, params.authorId), isNull(articles.deletedAt)))
    .groupBy(articles.id, articles.title, articles.createdAt)
    .orderBy(desc(articles.createdAt))
    .limit(params.pageSize)
    .offset(params.offset);
}

export async function countAuthorDashboardRows(authorId: string) {
  const result = await db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(articles)
    .where(and(eq(articles.authorId, authorId), isNull(articles.deletedAt)));

  return Number(result[0]?.total ?? 0);
}
