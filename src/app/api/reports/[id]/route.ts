import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reports } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET: Return full report with all related data
 */
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reportId = Number(id);

    const report = await db.query.reports.findFirst({
      where: (r, { eq }) => eq(r.id, reportId),
      with: {
        issues: true,
        scheduleScope: true,
        financials: true,
        appendix: true,
      },
    });

    if (!report)
      return NextResponse.json({ error: "Report not found" }, { status: 404 });

    return NextResponse.json(report);
  } catch (err) {
    console.error("GET /api/reports/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

/**
 * PUT: Update existing report instead of versioning
 */
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reportId = Number(id);
    const data = await req.json();

    const [updated] = await db
      .update(reports)
      .set({
        name: data.name,
        department: data.department,
        startDate: data.startDate,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId))
      .returning();

    if (!updated)
      return NextResponse.json({ error: "Report not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/reports/[id] error:", err);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}