import { FastifyReply, FastifyRequest } from "fastify";
import {
  getRequestUser,
} from "../../shared/auth/auth.middleware";
import {
  sendPaginatedSuccess,
  sendSuccess,
} from "../../shared/fastify/response-handler";
import { AppError } from "../../shared/types/app-error";
import { ArticleService } from "./article.service";
import {
  ArticleListQuery,
  ArticlePathParams,
  CreateArticleBody,
  MyArticlesQuery,
  UpdateArticleBody,
} from "./article.type";

const articleService = new ArticleService();

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

export async function createArticleController(
  request: FastifyRequest<{ Body: CreateArticleBody }>,
  reply: FastifyReply
) {
  const user = requireAuthUser(request);
  const data = await articleService.create(user, request.body);

  return sendSuccess(reply, 201, "Article created successfully", data);
}

export async function getMyArticlesController(
  request: FastifyRequest<{ Querystring: MyArticlesQuery }>,
  reply: FastifyReply
) {
  const user = requireAuthUser(request);
  const result = await articleService.listMine(user, request.query);

  return sendPaginatedSuccess(
    reply,
    200,
    "Articles fetched successfully",
    result.rows,
    result.pageNumber,
    result.pageSize,
    result.totalSize
  );
}

export async function updateArticleController(
  request: FastifyRequest<{
    Params: ArticlePathParams;
    Body: UpdateArticleBody;
  }>,
  reply: FastifyReply
) {
  const user = requireAuthUser(request);
  const data = await articleService.update(user, request.params.id, request.body);

  return sendSuccess(reply, 200, "Article updated successfully", data);
}

export async function deleteArticleController(
  request: FastifyRequest<{ Params: ArticlePathParams }>,
  reply: FastifyReply
) {
  const user = requireAuthUser(request);
  const data = await articleService.softDelete(user, request.params.id);

  return sendSuccess(reply, 200, "Article deleted successfully", data);
}

export async function listPublicArticlesController(
  request: FastifyRequest<{ Querystring: ArticleListQuery }>,
  reply: FastifyReply
) {
  const result = await articleService.listPublic(request.query);

  return sendPaginatedSuccess(
    reply,
    200,
    "Articles fetched successfully",
    result.rows,
    result.pageNumber,
    result.pageSize,
    result.totalSize
  );
}

export async function getArticleByIdController(
  request: FastifyRequest<{ Params: ArticlePathParams }>,
  reply: FastifyReply
) {
  const reader = getRequestUser(request);
  const data = await articleService.getById(request.params.id, reader);

  return sendSuccess(reply, 200, "Article fetched successfully", data);
}
