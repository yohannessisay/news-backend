import { config } from "dotenv";
import { NodeEnvironment } from "../types/common.type";

config({ quiet: true });

const validNodeEnvironments: NodeEnvironment[] = [
  "development",
  "production",
  "test",
];

const rawNodeEnvironment = process.env.NODE_ENV;
const nodeEnv: NodeEnvironment = validNodeEnvironments.includes(
  rawNodeEnvironment as NodeEnvironment
)
  ? (rawNodeEnvironment as NodeEnvironment)
  : "development";

const rawPort = Number(process.env.PORT ?? 4000);
const rawJwtAccessTokenExpiresInSeconds = Number(
  process.env.JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS ?? 3600
);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

export const env = {
  nodeEnv,
  port: Number.isNaN(rawPort) ? 4000 : rawPort,
  jwtSecret,
  jwtIssuer: process.env.JWT_ISSUER ?? "",
  jwtAudience: process.env.JWT_AUDIENCE ?? "",
  jwtAccessTokenExpiresInSeconds: Number.isNaN(rawJwtAccessTokenExpiresInSeconds)
    ? 3600
    : rawJwtAccessTokenExpiresInSeconds,
};
