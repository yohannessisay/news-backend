import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  optionalAuthPreHandler,
  requireAuthPreHandler,
  requireRolePreHandler,
} from "../../shared/auth/auth.middleware";
import {
  createArticleController,
  deleteArticleController,
  getArticleByIdController,
  getMyArticlesController,
  listPublicArticlesController,
  updateArticleController,
} from "./article.controller";
import {
  ArticleDetailResponseSchema,
  ArticleErrorResponseSchema,
  ArticleListQuery,
  ArticleListQuerySchema,
  ArticlePathParams,
  ArticlePathParamsSchema,
  CreateArticleBody,
  CreateArticleBodySchema,
  CreateArticleResponseSchema,
  DeleteArticleResponseSchema,
  MyArticleListResponseSchema,
  MyArticlesQuery,
  MyArticlesQuerySchema,
  PublicArticleListResponseSchema,
  UpdateArticleBody,
  UpdateArticleBodySchema,
  UpdateArticleResponseSchema,
} from "./article.type";

const authorOnlyPreHandlers = [
  requireAuthPreHandler,
  requireRolePreHandler(["author"]),
];

const articleRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.post<{ Body: CreateArticleBody }>(
    "/articles",
    {
      preHandler: authorOnlyPreHandlers,
      schema: {
        tags: ["Articles"],
        summary: "Create article (author only)",
        security: [{ BearerAuth: [] }],
        body: CreateArticleBodySchema,
        response: {
          201: CreateArticleResponseSchema,
          400: ArticleErrorResponseSchema,
          401: ArticleErrorResponseSchema,
          403: ArticleErrorResponseSchema,
          500: ArticleErrorResponseSchema,
        },
      },
    },
    createArticleController
  );

  app.get<{ Querystring: MyArticlesQuery }>(
    "/articles/me",
    {
      preHandler: authorOnlyPreHandlers,
      schema: {
        tags: ["Articles"],
        summary: "Get own articles including drafts (author only)",
        security: [{ BearerAuth: [] }],
        querystring: MyArticlesQuerySchema,
        response: {
          200: MyArticleListResponseSchema,
          401: ArticleErrorResponseSchema,
          403: ArticleErrorResponseSchema,
          500: ArticleErrorResponseSchema,
        },
      },
    },
    getMyArticlesController
  );

  app.put<{ Params: ArticlePathParams; Body: UpdateArticleBody }>(
    "/articles/:id",
    {
      preHandler: authorOnlyPreHandlers,
      schema: {
        tags: ["Articles"],
        summary: "Update own article (author only)",
        security: [{ BearerAuth: [] }],
        params: ArticlePathParamsSchema,
        body: UpdateArticleBodySchema,
        response: {
          200: UpdateArticleResponseSchema,
          400: ArticleErrorResponseSchema,
          401: ArticleErrorResponseSchema,
          403: ArticleErrorResponseSchema,
          404: ArticleErrorResponseSchema,
          410: ArticleErrorResponseSchema,
          500: ArticleErrorResponseSchema,
        },
      },
    },
    updateArticleController
  );

  app.delete<{ Params: ArticlePathParams }>(
    "/articles/:id",
    {
      preHandler: authorOnlyPreHandlers,
      schema: {
        tags: ["Articles"],
        summary: "Soft delete own article (author only)",
        security: [{ BearerAuth: [] }],
        params: ArticlePathParamsSchema,
        response: {
          200: DeleteArticleResponseSchema,
          401: ArticleErrorResponseSchema,
          403: ArticleErrorResponseSchema,
          404: ArticleErrorResponseSchema,
          410: ArticleErrorResponseSchema,
          500: ArticleErrorResponseSchema,
        },
      },
    },
    deleteArticleController
  );

  app.get<{ Querystring: ArticleListQuery }>(
    "/articles",
    {
      schema: {
        tags: ["Articles"],
        summary: "Get published public article feed",
        querystring: ArticleListQuerySchema,
        response: {
          200: PublicArticleListResponseSchema,
          500: ArticleErrorResponseSchema,
        },
      },
    },
    listPublicArticlesController
  );

  app.get<{ Params: ArticlePathParams }>(
    "/articles/:id",
    {
      preHandler: [optionalAuthPreHandler],
      schema: {
        tags: ["Articles"],
        summary: "Get article detail and trigger read tracking",
        params: ArticlePathParamsSchema,
        response: {
          200: ArticleDetailResponseSchema,
          404: ArticleErrorResponseSchema,
          410: ArticleErrorResponseSchema,
          500: ArticleErrorResponseSchema,
        },
      },
    },
    getArticleByIdController
  );
};

export default articleRoutes;
