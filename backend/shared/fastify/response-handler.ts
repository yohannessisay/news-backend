import { FastifyReply } from "fastify";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../types/response.type";

export function sendSuccess<T>(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  object: T
) {
  const response: ApiSuccessResponse<T> = {
    Success: true,
    Message: message,
    Object: object,
    Errors: null,
  };

  return reply.status(statusCode).send(response);
}

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  errors: string[] | null = null
) {
  const response: ApiErrorResponse = {
    Success: false,
    Message: message,
    Object: null,
    Errors: errors,
  };

  return reply.status(statusCode).send(response);
}
