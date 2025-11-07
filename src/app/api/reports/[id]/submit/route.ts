// src/app/api/reports/[id]/submit/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import {
  reports,
  reportSnapshots,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/reports/[id]/submit
 * Create a frozen monthly snapshot of the report and its children.
 */
export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> } // ✅ must await params in Next 15+
) {
  try {
    const { id } = await context.params;
    const reportId = Number(id);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
    }

    // --- 1️⃣ Load the full report tree with children
    const fullReport = await db.query.reports.findFirst({
      where: (r, { eq }) => eq(r.id, reportId),
      with: {
        issues: true,
        scheduleScope: true,
        financials: true,
        appendix: true,
      },
    });

    if (!fullReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // --- 2️⃣ Serialize snapshot payload
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

    // --- 4️⃣ Touch report's updatedAt timestamp
    await db
      .update(reports)
      .set({ updatedAt: new Date() })
      .where(eq(reports.id, reportId));

    // --- 5️⃣ Respond success
    return NextResponse.json({
      success: true,
      message: "Snapshot saved successfully",
    });
  } catch (err: any) {
    console.error("POST /api/reports/[id]/submit error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to snapshot report" },
      { status: 500 },
    );
  }
}
