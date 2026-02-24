import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../utils/env";
import * as schema from "./schema";

const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  ssl: false,
});

export const db = drizzle(pool, { schema });
