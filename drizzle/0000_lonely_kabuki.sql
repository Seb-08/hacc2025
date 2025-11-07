CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."snapshot_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TABLE "appendix" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"content" text
);
--> statement-breakpoint
CREATE TABLE "financials" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"original_contract_amt" numeric(12, 2) NOT NULL,
	"paid_to_date" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"description" text NOT NULL,
	"start_date" date NOT NULL,
	"impact" "risk_level" NOT NULL,
	"likelihood" "risk_level" NOT NULL,
	"overall_risk" integer NOT NULL,
	"recommendation" text,
	"status" "status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"snapshot_data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "snapshot_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"department" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_latest" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schedule_scope" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"task" text NOT NULL,
	"target_date" date NOT NULL,
	"completion_percent" numeric(5, 2) DEFAULT '0.00',
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "appendix" ADD CONSTRAINT "appendix_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financials" ADD CONSTRAINT "financials_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_snapshots" ADD CONSTRAINT "report_snapshots_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_scope" ADD CONSTRAINT "schedule_scope_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;