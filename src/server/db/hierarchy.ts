import { db } from '../db';
import { departments, projects, monthlyReports, issues, schedules } from './schema';
import { eq, desc, sql } from 'drizzle-orm';

// --- Warehouse ID Generation ---
interface WarehouseIdParams {
  departmentCode: string;
  projectCode: string;
  reportCode: string;
}

export function generateWarehouseId(params: WarehouseIdParams): string {
  const paddedDepartmentCode = params.departmentCode.toString().padStart(2, '0');
  const paddedProjectCode = params.projectCode.toString().padStart(4, '0');
  const paddedReportCode = params.reportCode.toString().padStart(2, '0');
  return `${paddedDepartmentCode}-${paddedProjectCode}-${paddedReportCode}`;
}

// --- Create Monthly Report Params ---
interface CreateMonthlyReportParams {
  departmentId: number;
  projectName?: string;
  existingProjectId?: number;
  startDate?: string;
  projectedEndDate?: string;
  issueId?: number;
  scheduleId?: number;
  newIssue?: {
    name: string;
    issueDescription?: string;
    impact: string;
    recommendedSolution?: string;
    status?: string;
    resolutionDescription?: string;
  };
  newSchedule?: {
    featureName: string;
    deadlineDate: string;
    completed?: boolean;
    status?: string;
    dateClosed?: string;
  };
  approvedBudget?: number;
  totalSpent?: number;
  expectedFeatures?: number;
  completedFeatures?: number;
  observations?: string;
  summary?: string;
  report_description?: string;
  projectPhase?: string;
  projectHealth?: string;
  status?: string;
}

// --- Create Monthly Report ---
export async function createMonthlyReport(params: CreateMonthlyReportParams) {
  const {
    departmentId,
    projectName,
    existingProjectId,
    issueId,
    scheduleId,
    newIssue,
    newSchedule,
    approvedBudget,
    totalSpent,
    expectedFeatures,
    completedFeatures,
    observations,
    summary,
    report_description,
    projectPhase,
    projectHealth,
    status,
    startDate,
    projectedEndDate,
  } = params;

  // --- Handle Project ---
  let projectRecord;
  if (existingProjectId) {
    projectRecord = await db.query.projects.findFirst({
      where: eq(projects.id, existingProjectId),
    });
  } else if (projectName) {
    const departmentRecord = await db.query.departments.findFirst({
      where: eq(departments.id, departmentId),
    });
    if (!departmentRecord) throw new Error('Department not found.');
    if (!startDate || !projectedEndDate)
      throw new Error('Start date and projected end date are required for new project.');

    const newProjectCode = await generateNewProjectCode();
    const insertedProject = await db.insert(projects).values({
      name: projectName,
      code: newProjectCode,
      departmentId: departmentRecord.id,
      startDate,
      projectedEndDate,
    }).returning();

    if (!insertedProject?.[0]?.id) throw new Error('Failed to create project.');
    projectRecord = insertedProject[0];
  } else {
    throw new Error('Must specify an existing project or a new project name.');
  }

  if (!projectRecord) throw new Error('Project not found or could not be created.');

  const departmentRecord = await db.query.departments.findFirst({
    where: eq(departments.id, projectRecord.departmentId),
  });
  if (!departmentRecord) throw new Error('Associated department not found.');

  // --- Update Existing Issue if Provided ---
  let issueRecordId = issueId;
  if (issueId) {
    const existingIssue = await db.query.issues.findFirst({ where: eq(issues.id, issueId) });
    if (!existingIssue) throw new Error('Selected issue not found');

    // Only update if new status or resolution is provided
    if (params.newIssue?.status || params.newIssue?.resolutionDescription) {
      await db.update(issues).set({
        status: params.newIssue.status ?? existingIssue.status,
        resolutionDescription: params.newIssue.resolutionDescription ?? existingIssue.resolutionDescription,
      }).where(eq(issues.id, issueId));
    }
  }

  // --- Create New Issue if Provided ---
  if (newIssue?.name) {
    const insertedIssue = await db.insert(issues).values({
      projectId: projectRecord.id,
      name: newIssue.name,
      issueDescription: newIssue.issueDescription ?? null,
      impact: newIssue.impact,
      recommendedSolution: newIssue.recommendedSolution ?? null,
      status: newIssue.status ?? 'Open',
      resolutionDescription: newIssue.status === 'Closed' ? newIssue.resolutionDescription ?? '' : null,
    }).returning();
    issueRecordId = insertedIssue?.[0]?.id;
  }

  // --- Update Existing Schedule if Provided ---
  let scheduleRecordId = scheduleId;
  if (scheduleId) {
    const existingSchedule = await db.query.schedules.findFirst({ where: eq(schedules.id, scheduleId) });
    if (!existingSchedule) throw new Error('Selected schedule not found');

    const completed = params.newSchedule?.completed ?? existingSchedule.completed;
    const statusValue = params.newSchedule?.status ?? existingSchedule.status;
    const dateClosed = (completed || statusValue === 'closed') ? sql`CURRENT_DATE` : existingSchedule.dateClosed ?? null;

    await db.update(schedules).set({
      completed,
      status: statusValue,
      dateClosed,
    }).where(eq(schedules.id, scheduleId));
  }

  // --- Create New Schedule if Provided ---
  if (newSchedule?.featureName) {
    const insertedSchedule = await db.insert(schedules).values({
      projectId: projectRecord.id,
      featureName: newSchedule.featureName,
      deadlineDate: newSchedule.deadlineDate,
      completed: newSchedule.completed ?? false,
      status: newSchedule.status ?? 'open',
      dateClosed: newSchedule.status === 'closed' || newSchedule.completed ? sql`CURRENT_DATE` : null,
    }).returning();
    scheduleRecordId = insertedSchedule?.[0]?.id;
  }

  // --- Generate Next Report Code ---
  const lastReport = await db.select().from(monthlyReports)
    .where(eq(monthlyReports.projectId, projectRecord.id))
    .orderBy(desc(monthlyReports.warehouseId))
    .limit(1);

  const lastReportCode = lastReport[0]?.warehouseId?.split('-')[2] ?? '0';
  const nextReportCode = (parseInt(lastReportCode, 10) + 1).toString().padStart(2, '0');

  const warehouseId = generateWarehouseId({
    departmentCode: departmentRecord.code,
    projectCode: projectRecord.code,
    reportCode: nextReportCode,
  });

  // --- Create Monthly Report ---
  const insertedReport = await db.insert(monthlyReports).values({
    warehouseId,
    reportDate: sql`CURRENT_DATE`,
    projectId: projectRecord.id,
    issueId: issueRecordId ?? null,
    scheduleId: scheduleRecordId ?? null,
    departmentId,
    approvedBudget: approvedBudget ?? 0,
    totalSpent: totalSpent ?? 0,
    expectedFeatures: expectedFeatures ?? 0,
    completedFeatures: completedFeatures ?? 0,
    observations: observations ?? '',
    summary: summary ?? '',
    report_description: report_description ?? '',
    projectPhase: projectPhase ?? 'Planning',
    projectHealth: projectHealth ?? 'Good',
    status: status ?? 'Draft',
  }).returning();

  if (!insertedReport?.[0]?.id) throw new Error('Failed to create monthly report.');

  return insertedReport[0];
}

// --- Generate New Project Code ---
async function generateNewProjectCode(): Promise<string> {
  const lastProject = await db.select().from(projects)
    .orderBy(desc(projects.code))
    .limit(1);
  const lastCode = parseInt(lastProject[0]?.code ?? '0', 10);
  return (lastCode + 1).toString().padStart(4, '0');
}