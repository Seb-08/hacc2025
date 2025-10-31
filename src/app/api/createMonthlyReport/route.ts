import { NextRequest, NextResponse } from 'next/server';
import { createMonthlyReport } from '~/server/db/hierarchy';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const report = await createMonthlyReport({
      departmentId: body.departmentId,
      projectName: body.projectName,
      existingProjectId: body.existingProjectId,
      issueId: body.issueId,
      scheduleId: body.scheduleId,
      newIssue: body.newIssue,
      newSchedule: body.newSchedule,
      reportData: body.reportData,
    });

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('Error creating report:', err);
    return NextResponse.json({ error: err.message || 'Failed to create report' }, { status: 500 });
  }
}
