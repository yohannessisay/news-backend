import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  requireAuthPreHandler,
  requireRolePreHandler,
} from "../../shared/auth/auth.middleware";
import { processAnalyticsController } from "./analytics.controller";
import {
  ProcessAnalyticsBody,
  ProcessAnalyticsBodySchema,
  ProcessAnalyticsErrorResponseSchema,
  ProcessAnalyticsSuccessResponseSchema,
} from "./analytics.type";

const analyticsRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.post<{ Body: ProcessAnalyticsBody }>(
    "/analytics/process",
    {
      preHandler: [requireAuthPreHandler, requireRolePreHandler(["author"])],
      schema: {
        tags: ["Analytics"],
        summary: "Process daily analytics for a UTC date (author only)",
        security: [{ BearerAuth: [] }],
        body: ProcessAnalyticsBodySchema,
        response: {
          202: ProcessAnalyticsSuccessResponseSchema,
          400: ProcessAnalyticsErrorResponseSchema,
          401: ProcessAnalyticsErrorResponseSchema,
          403: ProcessAnalyticsErrorResponseSchema,
          500: ProcessAnalyticsErrorResponseSchema,
        },
      },
    },
    processAnalyticsController
  );
};

export default analyticsRoutes;
