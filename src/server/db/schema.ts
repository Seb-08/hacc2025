import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  date,
  timestamp,
  boolean,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- ENUMS ----------
export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high"]);
export const statusEnum = pgEnum("status", ["open", "closed"]);
export const userRoleEnum = pgEnum("user_role", ["public", "vendor", "admin"]);

// NEW: Snapshot moderation status
export const snapshotStatusEnum = pgEnum("snapshot_status", [
  "pending",
  "approved",
  "denied",
]);

// ---------- REPORTS ----------
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  version: integer("version").notNull().default(1),
  isLatest: boolean("is_latest").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  status: statusEnum("status").notNull().default("open"),
});

// ---------- ISSUES ----------
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  startDate: date("start_date").notNull(),
  impact: riskLevelEnum("impact").notNull(),
  likelihood: riskLevelEnum("likelihood").notNull(),
  overallRisk: integer("overall_risk").notNull(),
  recommendation: text("recommendation"),
  status: statusEnum("status").notNull(),
});

// ---------- SCHEDULE + SCOPE ----------
export const scheduleScope = pgTable("schedule_scope", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  task: text("task").notNull(),
  targetDate: date("target_date").notNull(),
  completionPercent: numeric("completion_percent", {
    precision: 5,
    scale: 2,
  }).default("0.00"),
  notes: text("notes"),
});

// ---------- FINANCIALS ----------
export const financials = pgTable("financials", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  originalContractAmt: numeric("original_contract_amt", {
    precision: 12,
    scale: 2,
  }).notNull(),
  paidToDate: numeric("paid_to_date", {
    precision: 12,
    scale: 2,
  }).notNull(),
});

// ---------- APPENDIX ----------
export const appendix = pgTable("appendix", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content"),
});

// ---------- REPORT SNAPSHOTS ----------
export const reportSnapshots = pgTable("report_snapshots", {
  id: serial("id").primaryKey(),

  reportId: integer("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),

  snapshotData: text("snapshot_data").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  status: snapshotStatusEnum("status").notNull().default("pending"),

  approvedAt: timestamp("approved_at"),

  signatureName: text('signature_name'),
  signatureMethod: varchar('signature_method', { length: 32 }),
  signatureUrl: text('signature_url'),

});

// ---------- USERS TABLE ----------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("vendor"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- RELATIONS ----------

export const reportRelations = relations(reports, ({ many }) => ({
  issues: many(issues),
  scheduleScope: many(scheduleScope),
  financials: many(financials),
  appendix: many(appendix),
  snapshots: many(reportSnapshots),
}));

export const issueRelations = relations(issues, ({ one }) => ({
  report: one(reports, {
    fields: [issues.reportId],
    references: [reports.id],
  }),
}));

export const scheduleScopeRelations = relations(scheduleScope, ({ one }) => ({
  report: one(reports, {
    fields: [scheduleScope.reportId],
    references: [reports.id],
  }),
}));

export const financialRelations = relations(financials, ({ one }) => ({
  report: one(reports, {
    fields: [financials.reportId],
    references: [reports.id],
  }),
}));

export const appendixRelations = relations(appendix, ({ one }) => ({
  report: one(reports, {
    fields: [appendix.reportId],
    references: [reports.id],
  }),
}));

export const reportSnapshotRelations = relations(reportSnapshots, ({ one }) => ({
  report: one(reports, {
    fields: [reportSnapshots.reportId],
    references: [reports.id],
  }),
}));