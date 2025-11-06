// src/app/api/reports/[id]/submit/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import {
  reports,
  issues,
  scheduleScope,
  financials,
  appendix,
  reportSnapshots,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/reports/[id]/submit
 * Create a frozen monthly snapshot of the report and its children.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = Number(params.id);
    if (isNaN(reportId))
      return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });

    // --- 1️⃣ Load the full report tree
    const fullReport = await db.query.reports.findFirst({
      where: (r, { eq }) => eq(r.id, reportId),
      with: {
        issues: true,
        scheduleScope: true,
        financials: true,
        appendix: true,
      },
    });

    if (!fullReport)
      return NextResponse.json({ error: "Report not found" }, { status: 404 });

    // --- 2️⃣ Serialize the data for snapshot
    const snapshotJSON = JSON.stringify({
      ...fullReport,
      submittedAt: new Date().toISOString(),
    });

    // --- 3️⃣ Save snapshot record
    await db.insert(reportSnapshots).values({
      reportId,
      snapshotData: snapshotJSON,
      createdAt: new Date(),
    });

    // --- 4️⃣ Optionally mark the report as latest snapshot
    await db
      .update(reports)
      .set({ updatedAt: new Date() })
      .where(eq(reports.id, reportId));

    // --- 5️⃣ Return success
    return NextResponse.json({
      success: true,
      message: "Snapshot saved successfully",
    });
  } catch (err: any) {
    console.error("POST /api/reports/[id]/submit error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to snapshot report" },
      { status: 500 }
    );
  }
}
