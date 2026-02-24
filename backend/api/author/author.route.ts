import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  requireAuthPreHandler,
  requireRolePreHandler,
} from "../../shared/auth/auth.middleware";
import { getAuthorDashboardController } from "./author.controller";
import {
  AuthorDashboardErrorResponseSchema,
  AuthorDashboardQuery,
  AuthorDashboardQuerySchema,
  AuthorDashboardSuccessResponseSchema,
} from "./author.type";

const authorRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get<{ Querystring: AuthorDashboardQuery }>(
    "/author/dashboard",
    {
      preHandler: [requireAuthPreHandler, requireRolePreHandler(["author"])],
      schema: {
        tags: ["Author"],
        summary: "Get author performance dashboard",
        security: [{ BearerAuth: [] }],
        querystring: AuthorDashboardQuerySchema,
        response: {
          200: AuthorDashboardSuccessResponseSchema,
          401: AuthorDashboardErrorResponseSchema,
          403: AuthorDashboardErrorResponseSchema,
          500: AuthorDashboardErrorResponseSchema,
        },
      },
    },
    getAuthorDashboardController
  );
};

export default authorRoutes;
