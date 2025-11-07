import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reportSnapshots } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const reportId = Number(id);
  const snaps = await db
    .select()
    .from(reportSnapshots)
    .where(eq(reportSnapshots.reportId, reportId))
    .orderBy(desc(reportSnapshots.createdAt));

  return NextResponse.json(snaps);
}
