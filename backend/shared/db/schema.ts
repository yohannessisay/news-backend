import {
  check,
  date,
  integer,
  pgEnum,
  pgTable,
  pgSchema,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  createAuditColumns,
  createAuditUserForeignKeys,
} from "./audit-columns";

const securitySchema = pgSchema("security");
export const userRoleEnum = securitySchema.enum("user_role", ["author", "reader"]);
export const articleStatusEnum = pgEnum("article_status", ["Draft", "Published"]);

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

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 150 }).notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    status: articleStatusEnum("status").notNull().default("Draft"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...createAuditColumns(),
  },
  (table) => [
    check("articles_title_length_check", sql`char_length(${table.title}) between 1 and 150`),
    check("articles_content_length_check", sql`char_length(${table.content}) >= 50`),
    ...createAuditUserForeignKeys(table, users.id, "articles"),
  ]
);

export const readLogs = pgTable(
  "read_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    readerId: uuid("reader_id").references(() => users.id, { onDelete: "set null" }),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
    ...createAuditColumns(),
  },
  (table) => [...createAuditUserForeignKeys(table, users.id, "read_logs")]
);

export const dailyAnalytics = pgTable(
  "daily_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    viewCount: integer("view_count").notNull().default(0),
    date: date("date", { mode: "date" }).notNull(),
    ...createAuditColumns(),
  },
  (table) => [
    unique("daily_analytics_article_id_date_unique").on(table.articleId, table.date),
    ...createAuditUserForeignKeys(table, users.id, "daily_analytics"),
  ]
);
