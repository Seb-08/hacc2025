import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reports, reportSnapshots } from "~/server/db/schema";
import { eq, and, exists } from "drizzle-orm";

/**
 * GET: Return all latest reports that have at least one approved snapshot
 */
export async function GET() {
  try {
    const allReports = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.isLatest, true),
          exists(
            db
              .select({ id: reportSnapshots.id })
              .from(reportSnapshots)
              .where(
                and(
                  eq(reportSnapshots.reportId, reports.id),
                  eq(reportSnapshots.status, "approved") // ✅ must have approved snapshot
                )
              )
          )
        )
      )
      .orderBy(reports.createdAt);

    return NextResponse.json(allReports);
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new report (unchanged)
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const [newReport] = await db
      .insert(reports)
      .values({
        name: data.name,
        department: data.department,
        startDate: data.startDate,
      })
      .returning();

    return NextResponse.json(newReport);
  } catch (err) {
    console.error("POST /api/reports error:", err);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}