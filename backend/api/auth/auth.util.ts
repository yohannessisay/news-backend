import { createHash, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../shared/utils/env";
import { AccessTokenPayload } from "./auth.type";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createPasswordHash(rawPassword: string) {
  return createHash("sha256").update(rawPassword).digest("hex");
}

export function isPasswordValid(rawPassword: string, storedPasswordHash: string) {
  const incomingPasswordHash = createPasswordHash(rawPassword);
  const incomingBuffer = Buffer.from(incomingPasswordHash);
  const storedBuffer = Buffer.from(storedPasswordHash);

  if (incomingBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(incomingBuffer, storedBuffer);
}

export function buildAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.jwtAccessTokenExpiresInSeconds,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
  });
}
