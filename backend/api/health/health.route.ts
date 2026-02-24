import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { healthController } from "./health.controller";
import {
  HealthErrorResponseSchema,
  HealthSuccessResponseSchema,
} from "./health.type";

const healthRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check endpoint",
        response: {
          200: HealthSuccessResponseSchema,
          500: HealthErrorResponseSchema,
        },
      },
    },
    healthController
  );
};

export default healthRoutes;
