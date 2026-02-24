import { FastifyError, FastifyInstance } from "fastify";
import { ApiErrorResponse } from "../types/response.type";
import { AppError } from "../types/app-error";

type FastifyValidationIssue = {
  instancePath?: string;
  message?: string;
  keyword?: string;
};

function buildErrorResponse(
  message: string,
  code: string,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    message,
    data: null,
    error: {
      code,
      details,
    },
  };
}

function isValidationError(
  error: unknown
): error is FastifyError & { validation: FastifyValidationIssue[] } {
  return (
    typeof error === "object" &&
    error !== null &&
    Array.isArray((error as { validation?: unknown }).validation)
  );
}

export function registerGlobalErrorHandlers(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (isValidationError(error)) {
      const details = error.validation.map((issue) => ({
        field: issue.instancePath ?? "",
        message: issue.message ?? issue.keyword ?? "Invalid value",
      }));

      return reply
        .status(400)
        .send(buildErrorResponse("Request validation failed", "VALIDATION_ERROR", details));
    }

    if (error instanceof AppError) {
      return reply
        .status(error.statusCode)
        .send(buildErrorResponse(error.message, error.code, error.details));
    }

    app.log.error(error);

    return reply
      .status(500)
      .send(buildErrorResponse("Internal server error", "INTERNAL_SERVER_ERROR"));
  });

  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send(
      buildErrorResponse(
        `Route ${request.method} ${request.url} not found`,
        "ROUTE_NOT_FOUND"
      )
    );
  });
}
