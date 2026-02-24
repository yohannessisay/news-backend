import { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { AppError } from "../types/app-error";
import { env } from "../utils/env";
import { AuthenticatedUser, JwtTokenPayload } from "./auth.type";

type RequestWithAuthUser = FastifyRequest & {
  authUser?: AuthenticatedUser;
};

function extractBearerToken(request: FastifyRequest) {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader) {
    return null;
  }

  const [prefix, token] = authorizationHeader.split(" ");
  if (prefix !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function parseToken(token: string): AuthenticatedUser {
  const decoded = jwt.verify(token, env.jwtSecret, {
    algorithms: ["HS256"],
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
  }) as JwtTokenPayload;

  if (!decoded?.sub || !decoded?.role) {
    throw new AppError({
      statusCode: 401,
      message: "Invalid token",
    });
  }

  return {
    id: decoded.sub,
    role: decoded.role,
  };
}

export function getRequestUser(request: FastifyRequest) {
  return (request as RequestWithAuthUser).authUser ?? null;
}

export async function optionalAuthPreHandler(request: FastifyRequest) {
  const token = extractBearerToken(request);
  if (!token) {
    return;
  }

  try {
    (request as RequestWithAuthUser).authUser = parseToken(token);
  } catch {
    return;
  }
}

export async function requireAuthPreHandler(request: FastifyRequest) {
  const token = extractBearerToken(request);
  if (!token) {
    throw new AppError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  try {
    (request as RequestWithAuthUser).authUser = parseToken(token);
  } catch {
    throw new AppError({
      statusCode: 401,
      message: "Invalid or expired token",
    });
  }
}

export function requireRolePreHandler(roles: Array<AuthenticatedUser["role"]>) {
  return async function roleGuard(request: FastifyRequest) {
    const user = getRequestUser(request);

    if (!user || !roles.includes(user.role)) {
      throw new AppError({
        statusCode: 403,
        message: "Forbidden",
      });
    }
  };
}
