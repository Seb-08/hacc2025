// src/app/api/reports/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { reports } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET: Return all latest reports
 */
export async function GET() {
  try {
    const allReports = await db
      .select()
      .from(reports)
      .where(eq(reports.isLatest, true))
      .orderBy(reports.createdAt);

    return NextResponse.json(allReports);
  } catch (err) {
    console.error("GET /api/reports error:", err);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

/**
 * POST: Create a new report
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const newReport = await db
      .insert(reports)
      .values({
        name: data.name,
        department: data.department,
        startDate: data.startDate,
      })
      .returning();

    return NextResponse.json(newReport[0]);
  } catch (err) {
    console.error("POST /api/reports error:", err);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
