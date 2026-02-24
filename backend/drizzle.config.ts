import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

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

const dbUser = requireEnv("DB_USER");
const dbPassword = requireEnv("DB_PASSWORD");
const dbHost = requireEnv("DB_HOST");
const dbPort = requireNumberEnv("DB_PORT");
const dbName = requireEnv("DB_NAME");
const dbUrl = `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(
  dbPassword
)}@${dbHost}:${dbPort}/${dbName}?sslmode=disable`;

export default defineConfig({
  dialect: "postgresql",
  schema: "./shared/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: dbUrl,
  },
});
