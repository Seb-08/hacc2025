// src/app/api/reports/[id]/scope-schedule/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { scheduleScope } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const reportId = Number(id);
    const body = await req.json();

    const safeDate =
      body.targetDate && body.targetDate.trim() !== ""
        ? body.targetDate
        : new Date().toISOString().split("T")[0]; // fallback to today

    const created = await db
      .insert(scheduleScope)
      .values({
        reportId,
        task: body.task,
        targetDate: safeDate,
        completionPercent: body.completionPercent ?? 0,
        notes: body.notes ?? "",
      })
      .returning();

    return NextResponse.json(created[0]);
  } catch (err) {
    console.error("POST /scope-schedule error:", err);
    return NextResponse.json({ error: "Failed to create schedule row" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) throw new Error("Missing milestone ID");

    const safeDate =
      body.targetDate && body.targetDate.trim() !== ""
        ? body.targetDate
        : new Date().toISOString().split("T")[0];

    const updated = await db
      .update(scheduleScope)
      .set({
        task: body.task,
        targetDate: safeDate,
        completionPercent: body.completionPercent ?? 0,
        notes: body.notes ?? "",
      })
      .where(eq(scheduleScope.id, body.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("PUT /scope-schedule error:", err);
    return NextResponse.json({ error: "Failed to update schedule row" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) throw new Error("Missing milestone ID for deletion");

    await db.delete(scheduleScope).where(eq(scheduleScope.id, body.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /scope-schedule error:", err);
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}