// src/app/api/reports/[id]/appendix/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { appendix } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// POST → create new appendix row for this report
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // ✅ must await params in Next 15
    const reportId = Number(id);
    const body = await req.json();

    const created = await db
      .insert(appendix)
      .values({
        reportId,
        content: body.content ?? "",
      })
      .returning();

    return NextResponse.json(created[0]);
  } catch (err) {
    console.error("POST /appendix error:", err);
    return NextResponse.json({ error: "Failed to create appendix" }, { status: 500 });
  }
}

// PUT → update existing appendix row
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await context.params; // not used here, but still await for consistency
    const body = await req.json();

    const updated = await db
      .update(appendix)
      .set({
        content: body.content ?? "",
      })
      .where(eq(appendix.id, body.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("PUT /appendix error:", err);
    return NextResponse.json({ error: "Failed to update appendix" }, { status: 500 });
  }
}