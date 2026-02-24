import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../utils/env";
import * as schema from "./schema";

const connectionString = `postgresql://${encodeURIComponent(
  env.dbUser
)}:${encodeURIComponent(env.dbPassword)}@${env.dbHost}:${env.dbPort}/${env.dbName}?sslmode=disable`;

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
