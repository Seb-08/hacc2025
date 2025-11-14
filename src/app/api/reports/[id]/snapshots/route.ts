import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reportSnapshots } from "~/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const reportId = Number(id);

  if (Number.isNaN(reportId)) {
    return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
  }

  const snaps = await db
    .select()
    .from(reportSnapshots)
    .where(
      and(
        eq(reportSnapshots.reportId, reportId),
        eq(reportSnapshots.status, "approved") // ✅ Only approved
      )
    )
    .orderBy(desc(reportSnapshots.createdAt));

  return NextResponse.json(snaps);
}