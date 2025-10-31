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
  reportData: string;
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
    reportData,
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

    const newProjectCode = await generateNewProjectCode();

    const [newProject] = (await db.insert(projects).values({
      name: projectName,
      code: newProjectCode,
      departmentId: departmentRecord.id,
    }).returning()) ?? [];

    if (!newProject) throw new Error('Failed to create project.');
    projectRecord = newProject;
  } else {
    throw new Error('Must specify an existing project or a new project name.');
  }

  if (!projectRecord) throw new Error('Project not found or could not be created.');

  const departmentRecord = await db.query.departments.findFirst({
    where: eq(departments.id, projectRecord.departmentId),
  });
  if (!departmentRecord) throw new Error('Associated department not found.');

  // --- Handle Issue ---
  let issueRecordId = issueId;
  if (!issueRecordId && newIssue) {
    const [createdIssue] = (await db.insert(issues).values({
      name: newIssue.name,
      issueDescription: newIssue.issueDescription ?? null,
      impact: newIssue.impact,
      recommendedSolution: newIssue.recommendedSolution ?? null,
      status: newIssue.status ?? 'Open',
      resolutionDescription:
        newIssue.status === 'Closed' ? newIssue.resolutionDescription ?? '' : null,
    }).returning()) ?? [];

    if (!createdIssue) throw new Error('Failed to create issue.');
    issueRecordId = createdIssue.id;
  }

  // --- Handle Schedule ---
  let scheduleRecordId = scheduleId;
  if (!scheduleRecordId && newSchedule) {
    const [createdSchedule] = (await db.insert(schedules).values({
      featureName: newSchedule.featureName,
      deadlineDate: newSchedule.deadlineDate,
      completed: newSchedule.completed ?? false,
      status: newSchedule.status ?? 'open',
      dateClosed: newSchedule.status === 'closed'
        ? newSchedule.dateClosed ?? sql`CURRENT_DATE`
        : null,
    }).returning()) ?? [];

    if (!createdSchedule) throw new Error('Failed to create schedule.');
    scheduleRecordId = createdSchedule.id;
  }

  // --- Generate Next Report Code ---
  const lastReport = await db
    .select()
    .from(monthlyReports)
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
  const [newReport] = (await db
  .insert(monthlyReports)
  .values({
    warehouseId, // you already have this
    reportDate: sql`CURRENT_DATE`,
    report_description: reportData,
    summary: reportData,
    projectId: projectRecord.id,
    issueId: issueRecordId ?? null,
    scheduleId: scheduleRecordId ?? null,
    departmentId,

    approvedBudget: 0, 
    totalSpent: 0,     

    status: 'Draft',
    projectPhase: 'Planning',
    projectHealth: 'Good',
  })
  .returning()) ?? [];
  if (!newReport) throw new Error('Failed to create monthly report.');

  return newReport;
}

// --- Generate New Project Code ---
async function generateNewProjectCode(): Promise<string> {
  const lastProject = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.code))
    .limit(1);

  const lastCode = parseInt(lastProject[0]?.code ?? '0', 10);
  const nextCode = (lastCode + 1).toString().padStart(4, '0');
  return nextCode;
}
