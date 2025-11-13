// src/app/api/reports/[id]/submit/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reports, reportSnapshots, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { CreateEngagespotClient } from "@engagespot/node"; 

const engagespot = new CreateEngagespotClient({
  apiKey: process.env.ENGAGESPOT_API_KEY!,
  apiSecret: process.env.ENGAGESPOT_API_SECRET!,
});


/**
 * POST /api/reports/[id]/submit
 * Create a frozen snapshot of the report and its children.
 * Snapshots are created as `pending` and must be approved
 * before appearing in the public "View" experience.
 */
export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reportId = Number(id);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: "Invalid report ID" },
        { status: 400 },
      );
    }

    // 1️⃣ Load the full report tree with children
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
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 },
      );
    }

    // 2️⃣ Serialize snapshot payload
    const now = new Date();
    const snapshotJSON = JSON.stringify({
      ...fullReport,
      submittedAt: now.toISOString(),
    });

    // 3️⃣ Save snapshot as PENDING
    const inserted = await db
      .insert(reportSnapshots)
      .values({
        reportId,
        snapshotData: snapshotJSON,
        createdAt: now,
        status: "pending", // 🔴 Awaiting review
      })
      .returning();

    const createdSnapshot = inserted[0];

    if (!createdSnapshot) {
      // Extremely defensive: should never happen unless DB fails silently
      return NextResponse.json(
        { error: "Failed to create snapshot record" },
        { status: 500 },
      );
    }

    // 4️⃣ Touch report's updatedAt timestamp
    await db
      .update(reports)
      .set({ updatedAt: now })
      .where(eq(reports.id, reportId));

const admins = await db.select().from(users).where(eq(users.role, "admin"));

try {
      const res = await engagespot.send({
        notification: {
          title: "New Report Submitted",
          message: "A vendor just submitted a new report for review.",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/review`,
        },
        sendTo: {
          recipients: ["admin@example.com"], 
        },
      });
      console.log("✅ Engagespot notification sent to demo admin:", res);
    } catch (err) {
      console.error("❌ Engagespot send failed for demo admin", err);
    }


    // 5️⃣ Respond success with snapshot metadata
    return NextResponse.json({
      success: true,
      message: "Snapshot submitted for review.",
      snapshotId: createdSnapshot.id,
      status: createdSnapshot.status,
      createdAt: createdSnapshot.createdAt,
    });
  } catch (err: any) {
    console.error("POST /api/reports/[id]/submit error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create snapshot" },
      { status: 500 },
    );
  }
}