import { NextRequest, NextResponse } from 'next/server';
import { createMonthlyReport } from '~/server/db/hierarchy';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = await createMonthlyReport({
      departmentId: body.departmentId,
      existingProjectId: body.existingProjectId,
      projectName: body.projectName,
      startDate: body.startDate,
      projectedEndDate: body.projectedEndDate,
      issueId: body.issueId,
      scheduleId: body.scheduleId,
      newIssue: body.newIssue,
      newSchedule: body.newSchedule,
      approvedBudget: body.approvedBudget,
      totalSpent: body.totalSpent,
      expectedFeatures: body.expectedFeatures,
      completedFeatures: body.completedFeatures,
      observations: body.observations,
      summary: body.summary,
      report_description: body.report_description,
      projectPhase: body.projectPhase,
      projectHealth: body.projectHealth,
      status: body.status,
    });

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('Error creating report:', err);
    return NextResponse.json({ error: err.message || 'Failed to create report' }, { status: 500 });
  }
}