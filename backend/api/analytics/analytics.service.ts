import {
  countArticleReadsForDate,
  createReadLogEvent,
  listArticleIdsForDate,
  toUtcDateString,
  upsertDailyAnalyticsRow,
} from "./analytics.model";

type AnalyticsJob = {
  articleId: string;
  date: string;
};

const pendingJobs: AnalyticsJob[] = [];
const pendingKeys = new Set<string>();
let isProcessing = false;

function jobKey(job: AnalyticsJob) {
  return `${job.articleId}:${job.date}`;
}

async function processQueue() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  while (pendingJobs.length > 0) {
    const job = pendingJobs.shift();
    if (!job) {
      continue;
    }

    const key = jobKey(job);
    pendingKeys.delete(key);

    try {
      const viewCount = await countArticleReadsForDate(job.articleId, job.date);
      await upsertDailyAnalyticsRow({
        articleId: job.articleId,
        date: job.date,
        viewCount,
      });
    } catch (error) {
      console.error("analytics_queue_job_failed", error);
    }
  }

  isProcessing = false;
}

export function enqueueAnalyticsJob(job: AnalyticsJob) {
  const key = jobKey(job);
  if (pendingKeys.has(key)) {
    return;
  }

  pendingKeys.add(key);
  pendingJobs.push(job);
  void processQueue();
}

export function getCurrentUtcDateString() {
  return toUtcDateString(new Date());
}

export function trackReadInBackground(input: {
  articleId: string;
  readerId: string | null;
}) {
  void (async () => {
    try {
      const readLog = await createReadLogEvent({
        articleId: input.articleId,
        readerId: input.readerId,
      });

      if (!readLog) {
        return;
      }

      enqueueAnalyticsJob({
        articleId: readLog.articleId,
        date: toUtcDateString(readLog.readAt),
      });
    } catch (error) {
      console.error("read_tracking_failed", error);
    }
  })();
}

export class AnalyticsService {
  async enqueueDailyAggregation(date: string) {
    const articleIds = await listArticleIdsForDate(date);

    for (const articleId of articleIds) {
      enqueueAnalyticsJob({
        articleId,
        date,
      });
    }

    return {
      date,
      enqueued: articleIds.length,
    };
  }
}
