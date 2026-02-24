CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "security";--> statement-breakpoint
CREATE TYPE "security"."user_role" AS ENUM('author', 'reader');--> statement-breakpoint
CREATE TABLE "security"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "security"."user_role" DEFAULT 'reader' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_name_format_check" CHECK ("security"."users"."name" ~ '^[A-Za-z ]+$'),
	CONSTRAINT "users_email_format_check" CHECK ("security"."users"."email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
--> statement-breakpoint
ALTER TABLE "security"."users" ADD CONSTRAINT "users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "security"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security"."users" ADD CONSTRAINT "users_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "security"."users"("id") ON DELETE set null ON UPDATE no action;
