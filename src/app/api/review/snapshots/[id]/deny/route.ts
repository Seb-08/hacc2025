// src/app/api/review/snapshots/[id]/deny/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reportSnapshots } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { CreateEngagespotClient } from '@engagespot/node';


const engagespot = new CreateEngagespotClient({
  apiKey: process.env.ENGAGESPOT_API_KEY!,
  apiSecret: process.env.ENGAGESPOT_API_SECRET!,
});

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const snapshotId = Number(id);
    if (isNaN(snapshotId)) {
      return NextResponse.json(
        { error: "Invalid snapshot ID" },
        { status: 400 }
      );
    }

    // Update status → denied
    const [updated] = await db
      .update(reportSnapshots)
      .set({
        status: "denied",
      })
      .where(eq(reportSnapshots.id, snapshotId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Snapshot not found" },
        { status: 404 }
      );
    }
    try {
      const res = await engagespot.send({
        notification: {
          title: "Report Approved ✅",
          message: "Your report has been denied by ETS.",
          url: ``,
        },
        sendTo: {
          recipients: ["vendor@example.com"], 
        },
      });
      console.log("✅ Engagespot notification sent to demo vendor:", res);
    } catch (err) {
      console.error("❌ Engagespot send failed for demo vendor", err);
    } 

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Deny snapshot error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to deny snapshot" },
      { status: 500 }
    );
  }
}
