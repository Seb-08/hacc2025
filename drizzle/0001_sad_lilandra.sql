CREATE TYPE "public"."user_role" AS ENUM('public', 'vendor', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'vendor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "report_snapshots" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "report_snapshots" ADD COLUMN "signature_name" text;--> statement-breakpoint
ALTER TABLE "report_snapshots" ADD COLUMN "signature_method" varchar(32);--> statement-breakpoint
ALTER TABLE "report_snapshots" ADD COLUMN "signature_url" text;