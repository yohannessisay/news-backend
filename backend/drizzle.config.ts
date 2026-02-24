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

export default defineConfig({
  dialect: "postgresql",
  schema: "./shared/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: requireEnv("DB_HOST"),
    port: requireNumberEnv("DB_PORT"),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
    ssl: false,
  },
});
