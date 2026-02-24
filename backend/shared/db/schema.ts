import {
  check,
  pgSchema,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  createAuditColumns,
  createAuditUserForeignKeys,
} from "./audit-columns";

const securitySchema = pgSchema("security");
const userRoleEnum = securitySchema.enum("user_role", ["author", "reader"]);

export const users = securitySchema.table(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull().default("reader"),
    ...createAuditColumns(),
  },
  (table) => [
    check("users_name_format_check", sql`${table.name} ~ '^[A-Za-z ]+$'`),
    check(
      "users_email_format_check",
      sql`${table.email} ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`
    ),
    ...createAuditUserForeignKeys(table, table.id, "users"),
  ]
);
