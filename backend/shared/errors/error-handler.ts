import { FastifyError, FastifyInstance } from "fastify";
import { sendError } from "../fastify/response-handler";
import { AppError } from "../types/app-error";

type FastifyValidationIssue = {
  instancePath?: string;
  message?: string;
  keyword?: string;
};

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
      const validationErrors = error.validation.map(
        (issue) => `${issue.instancePath || "body"}: ${issue.message ?? "Invalid value"}`
      );

      return sendError(reply, 400, "Request validation failed", validationErrors);
    }

    if (error instanceof AppError) {
      const errorList =
        error.errors && error.errors.length > 0 ? error.errors : [error.message];
      return sendError(reply, error.statusCode, error.message, errorList);
    }

    if (
      typeof (error as { statusCode?: unknown }).statusCode === "number" &&
      (error as { statusCode: number }).statusCode >= 400 &&
      (error as { statusCode: number }).statusCode < 500
    ) {
      const statusCode = (error as { statusCode: number }).statusCode;
      const message =
        (error as { message?: string }).message?.trim() || "Request failed";
      return sendError(reply, statusCode, message, [message]);
    }

    app.log.error(error);

    return sendError(reply, 500, "Internal server error", [
      "An unexpected error occurred",
    ]);
  });

  app.setNotFoundHandler((request, reply) => {
    return sendError(reply, 404, "Route not found", [
      `${request.method} ${request.url} not found`,
    ]);
  });
}
