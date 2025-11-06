// src/app/api/reports/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reports } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET: Return full report with all related data
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const report = await db.query.reports.findFirst({
      where: (r, { eq }) => eq(r.id, id),
      with: {
        issues: true,
        scheduleScope: true,
        financials: true,
        appendix: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error("GET /api/reports/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

/**
 * PUT: Versioned update — create a new report version and mark old one not latest
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const data = await req.json();

    const oldReport = await db.query.reports.findFirst({
      where: (r, { eq }) => eq(r.id, id),
    });

    if (!oldReport)
      return NextResponse.json({ error: "Report not found" }, { status: 404 });

    // mark old version as not latest
    await db.update(reports).set({ isLatest: false }).where(eq(reports.id, id));

    // create new version
    const newVersion = oldReport.version + 1;
    const newReport = await db
      .insert(reports)
      .values({
        name: data.name ?? oldReport.name,
        department: data.department ?? oldReport.department,
        startDate: data.startDate ?? oldReport.startDate,
        version: newVersion,
        isLatest: true,
      })
      .returning();

    return NextResponse.json(newReport[0]);
  } catch (err) {
    console.error("PUT /api/reports/[id] error:", err);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
