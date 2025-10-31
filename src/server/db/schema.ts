import { sql } from "drizzle-orm";
import { index, pgTableCreator, pgTable, serial, varchar, integer, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';


export const createTable = pgTableCreator((name) => `hacc_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    rating: d.real(),
    imageUrl: d.varchar({ length: 512 }), // <- new
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);
// ---------------- Departments ----------------
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 2 }).unique().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
});

// ---------------- Projects ----------------
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 4 }).unique().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  departmentId: integer('department_id').notNull().references(() => departments.id),
});

// ---------------- Issues ----------------
export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  issueDescription: varchar('issue_description', { length: 1024 }),
  impact: varchar('impact', { length: 10 }).notNull(), // 'High', 'Medium', 'Low'
  dateFirstRaised: date('date_first_raised').defaultNow(),
  recommendedSolution: varchar('recommended_solution', { length: 1024 }),
  status: varchar('status', { length: 10 }).notNull().default('Open'), // 'Open' or 'Closed'
  resolutionDescription: varchar('resolution_description', { length: 1024 }),
});

// ---------------- Schedules ----------------
export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  featureName: varchar('feature_name', { length: 255 }).notNull(),
  deadlineDate: date('deadline_date').notNull(),
  completed: boolean('completed').default(false).notNull(),
  status: varchar('status', { length: 10 }).notNull().default('open'), // "open" or "closed"
  dateClosed: date('date_closed'),
});

// ---------------- Monthly Reports ----------------
export const monthlyReports = pgTable('monthly_reports', {
  id: serial('id').primaryKey(),
  warehouseId: varchar('warehouse_id', { length: 256 }).unique().notNull(),
  departmentId: integer('department_id').notNull().references(() => departments.id),
  projectId: integer('project_id').notNull().references(() => projects.id),
  issueId: integer('issue_id').references(() => issues.id),
  scheduleId: integer('schedule_id').references(() => schedules.id),
  status: varchar('status', { length: 256 }),
  reportDate: date('report_date', { mode: 'date' }).notNull(),
  report_description: varchar('report_description', { length: 150 }),
  summary: varchar('summary', { length: 1024 }),
  projectPhase: varchar('project_phase', { length: 256 }),
  projectHealth: varchar('project_health', { length: 256 }),
  approvedBudget: integer('approved_budget').notNull(),
  totalSpent: integer('total_spent').notNull(),
  expectedFeatures: integer('expected_features'),
  completedFeatures: integer('completed_features'),
  observations: varchar('observations', { length: 2000 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
});

// ---------------- Relations ----------------
export const departmentRelations = relations(departments, ({ many }) => ({
  projects: many(projects),
  reports: many(monthlyReports),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  department: one(departments, {
    fields: [projects.departmentId],
    references: [departments.id],
  }),
  reports: many(monthlyReports),
}));

export const issueRelations = relations(issues, ({ many }) => ({
  reports: many(monthlyReports),
}));

export const scheduleRelations = relations(schedules, ({ many }) => ({
  reports: many(monthlyReports),
}));

export const monthlyReportRelations = relations(monthlyReports, ({ one }) => ({
  department: one(departments, {
    fields: [monthlyReports.departmentId],
    references: [departments.id],
  }),
  project: one(projects, {
    fields: [monthlyReports.projectId],
    references: [projects.id],
  }),
  issue: one(issues, {
    fields: [monthlyReports.issueId],
    references: [issues.id],
  }),
  schedule: one(schedules, {
    fields: [monthlyReports.scheduleId],
    references: [schedules.id],
  }),
}));