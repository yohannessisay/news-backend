import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../shared/utils/env";
import { AccessTokenPayload } from "./auth.type";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function isValidName(name: string) {
  return /^[A-Za-z ]+$/.test(name);
}

export async function createPasswordHash(rawPassword: string) {
  const saltRounds = 12;

  return bcrypt.hash(rawPassword, saltRounds);
}

export async function isPasswordValid(rawPassword: string, storedPasswordHash: string) {
  return bcrypt.compare(rawPassword, storedPasswordHash);
}

export function buildAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.jwtAccessTokenExpiresInSeconds,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
  });
}
