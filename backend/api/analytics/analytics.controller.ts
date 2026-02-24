import { FastifyReply, FastifyRequest } from "fastify";
import { getRequestUser } from "../../shared/auth/auth.middleware";
import { sendSuccess } from "../../shared/fastify/response-handler";
import { AppError } from "../../shared/types/app-error";
import {
  AnalyticsService,
  getCurrentUtcDateString,
} from "./analytics.service";
import { ProcessAnalyticsBody } from "./analytics.type";

const analyticsService = new AnalyticsService();

function requireAuthUser(request: FastifyRequest) {
  const user = getRequestUser(request);
  if (!user) {
    throw new AppError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  return user;
}

export async function processAnalyticsController(
  request: FastifyRequest<{ Body: ProcessAnalyticsBody }>,
  reply: FastifyReply
) {
  requireAuthUser(request);
  const date = request.body.date ?? getCurrentUtcDateString();
  const data = await analyticsService.enqueueDailyAggregation(date);

  return sendSuccess(reply, 202, "Analytics processing enqueued", data);
}
