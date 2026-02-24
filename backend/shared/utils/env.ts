import { config } from "dotenv";
import { NodeEnvironment } from "../types/common.type";

config({ quiet: true });

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function requireNumberEnv(name: string) {
  const rawValue = requireEnv(name);
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${name} must be a valid number`);
  }

  return parsedValue;
}

const validNodeEnvironments: NodeEnvironment[] = [
  "development",
  "production",
  "test",
];

const rawNodeEnvironment = requireEnv("NODE_ENV");
const nodeEnv: NodeEnvironment = validNodeEnvironments.includes(
  rawNodeEnvironment as NodeEnvironment
)
  ? (rawNodeEnvironment as NodeEnvironment)
  : (() => {
      throw new Error("NODE_ENV must be one of: development, production, test");
    })();

const host = requireEnv("HOST");
const port = requireNumberEnv("PORT");
const jwtAccessTokenExpiresInSeconds = requireNumberEnv(
  "JWT_ACCESS_TOKEN_EXPIRES_IN_SECONDS"
);

export const env = {
  nodeEnv,
  host,
  port,
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtIssuer: requireEnv("JWT_ISSUER"),
  jwtAudience: requireEnv("JWT_AUDIENCE"),
  jwtAccessTokenExpiresInSeconds,
  dbHost: requireEnv("DB_HOST"),
  dbPort: requireNumberEnv("DB_PORT"),
  dbUser: requireEnv("DB_USER"),
  dbPassword: requireEnv("DB_PASSWORD"),
  dbName: requireEnv("DB_NAME"),
};
