// src/app/api/review/snapshots/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reportSnapshots, reports } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/review/snapshots
 *
 * Returns ALL snapshots (pending, approved, denied)
 * with basic report info for context.
 */
export async function GET() {
  try {
    const snapshots = await db
      .select({
        id: reportSnapshots.id,
        reportId: reportSnapshots.reportId,
        status: reportSnapshots.status,
        createdAt: reportSnapshots.createdAt,
        snapshotData: reportSnapshots.snapshotData,

        // from reports
        reportName: reports.name,
        department: reports.department,
        reportStartDate: reports.startDate,
      })
      .from(reportSnapshots)
      .innerJoin(reports, eq(reportSnapshots.reportId, reports.id))
      .orderBy(desc(reportSnapshots.createdAt)); // newest first

    return NextResponse.json(snapshots);
  } catch (err: any) {
    console.error("GET /api/review/snapshots error:", err);
    return NextResponse.json(
      { error: "Failed to load snapshots" },
      { status: 500 },
    );
  }
}
