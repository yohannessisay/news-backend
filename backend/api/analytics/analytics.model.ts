import {
  and,
  eq,
  gte,
  lt,
  sql,
} from "drizzle-orm";
import { db } from "../../shared/db/client";
import { dailyAnalytics, readLogs } from "../../shared/db/schema";

function getUtcDateBounds(date: string) {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

export function toUtcDateString(input: Date) {
  return input.toISOString().slice(0, 10);
}

export async function createReadLogEvent(input: {
  articleId: string;
  readerId: string | null;
}) {
  if (input.readerId) {
    const threshold = new Date(Date.now() - 10_000);
    const latestReaderLog = await db
      .select({
        id: readLogs.id,
      })
      .from(readLogs)
      .where(
        and(
          eq(readLogs.articleId, input.articleId),
          eq(readLogs.readerId, input.readerId),
          gte(readLogs.readAt, threshold)
        )
      )
      .limit(1);

    if (latestReaderLog[0]) {
      return null;
    }
  }

  const now = new Date();
  const result = await db
    .insert(readLogs)
    .values({
      articleId: input.articleId,
      readerId: input.readerId,
      readAt: now,
      createdBy: input.readerId,
      updatedBy: input.readerId,
    })
    .returning({
      id: readLogs.id,
      articleId: readLogs.articleId,
      readAt: readLogs.readAt,
    });

  return result[0] ?? null;
}

export async function listArticleIdsForDate(date: string) {
  const bounds = getUtcDateBounds(date);

  const rows = await db
    .selectDistinct({
      articleId: readLogs.articleId,
    })
    .from(readLogs)
    .where(and(gte(readLogs.readAt, bounds.start), lt(readLogs.readAt, bounds.end)));

  return rows.map((item) => item.articleId);
}

export async function countArticleReadsForDate(articleId: string, date: string) {
  const bounds = getUtcDateBounds(date);

  const rows = await db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(readLogs)
    .where(
      and(
        eq(readLogs.articleId, articleId),
        gte(readLogs.readAt, bounds.start),
        lt(readLogs.readAt, bounds.end)
      )
    );

  return Number(rows[0]?.total ?? 0);
}

export async function upsertDailyAnalyticsRow(input: {
  articleId: string;
  date: string;
  viewCount: number;
}) {
  const analyticsDate = new Date(`${input.date}T00:00:00.000Z`);

  await db
    .insert(dailyAnalytics)
    .values({
      articleId: input.articleId,
      date: analyticsDate,
      viewCount: input.viewCount,
      createdBy: null,
      updatedBy: null,
    })
    .onConflictDoUpdate({
      target: [dailyAnalytics.articleId, dailyAnalytics.date],
      set: {
        viewCount: input.viewCount,
        updatedAt: new Date(),
        updatedBy: null,
      },
    });
}
