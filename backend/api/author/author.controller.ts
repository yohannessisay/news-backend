import { FastifyReply, FastifyRequest } from "fastify";
import { getRequestUser } from "../../shared/auth/auth.middleware";
import { sendPaginatedSuccess } from "../../shared/fastify/response-handler";
import { AppError } from "../../shared/types/app-error";
import { AuthorService } from "./author.service";
import { AuthorDashboardQuery } from "./author.type";

const authorService = new AuthorService();

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

export async function getAuthorDashboardController(
  request: FastifyRequest<{ Querystring: AuthorDashboardQuery }>,
  reply: FastifyReply
) {
  const user = requireAuthUser(request);
  const result = await authorService.getDashboard(user, request.query);

  return sendPaginatedSuccess(
    reply,
    200,
    "Dashboard fetched successfully",
    result.rows,
    result.pageNumber,
    result.pageSize,
    result.totalSize
  );
}
