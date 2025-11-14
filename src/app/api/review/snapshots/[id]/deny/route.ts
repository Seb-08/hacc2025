// src/app/api/review/snapshots/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reportSnapshots, reports } from "~/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/review/snapshots
 *
 * Returns all snapshots that are currently:
 *   - status = 'pending'
 *
 * Includes basic report info so reviewers
 * can see which project each snapshot belongs to.
 */
export async function GET() {
  try {
    // Join snapshots with their parent report for context
    const pending = await db
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
      .innerJoin(
        reports,
        eq(reportSnapshots.reportId, reports.id),
      )
      .where(eq(reportSnapshots.status, "pending"))
      .orderBy(desc(reportSnapshots.createdAt)); // newest pending first

    return NextResponse.json(pending);
  } catch (err: any) {
    console.error("GET /api/review/snapshots error:", err);
    return NextResponse.json(
      { error: "Failed to load pending snapshots" },
      { status: 500 },
    );
  }
}