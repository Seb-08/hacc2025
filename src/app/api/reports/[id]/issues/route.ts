// src/app/api/reports/[id]/issues/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { issues } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST: Create a new issue for a given report
 */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reportId = Number(id);
    const body = await req.json();

    const created = await db
      .insert(issues)
      .values({
        reportId,
        description: body.description,
        startDate: body.startDate,
        impact: body.impact,
        likelihood: body.likelihood,
        overallRisk: body.overallRisk,
        recommendation: body.recommendation,
        status: body.status,
      })
      .returning();

    return NextResponse.json(created[0]);
  } catch (err) {
    console.error("POST /issues error:", err);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}

/**
 * PUT: Update existing issue (no new row created)
 */
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reportId = Number(id);
    const body = await req.json();

    const updated = await db
      .update(issues)
      .set({
        reportId, // ✅ keep the foreign key linked to same report
        description: body.description,
        startDate: body.startDate,
        impact: body.impact,
        likelihood: body.likelihood,
        overallRisk: body.overallRisk,
        recommendation: body.recommendation,
        status: body.status,
      })
      .where(eq(issues.id, body.id))
      .returning();

    if (!updated.length)
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("PUT /issues error:", err);
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
  }
}