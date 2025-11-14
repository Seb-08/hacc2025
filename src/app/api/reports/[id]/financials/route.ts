// src/app/api/reports/[id]/financials/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { financials } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST – create a new financials record for this report
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ await params in Next.js 15+
  const reportId = Number(id);
  const body = await req.json();

  const created = await db
    .insert(financials)
    .values({
      reportId,
      originalContractAmt: body.originalContractAmt,
      paidToDate: body.paidToDate,
    })
    .returning();

  return NextResponse.json(created[0]);
}

/**
 * PUT – update an existing financials record
 */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await context.params; // (We don't actually need id here, but still await it)
  const body = await req.json();

  const updated = await db
    .update(financials)
    .set({
      originalContractAmt: body.originalContractAmt,
      paidToDate: body.paidToDate,
    })
    .where(eq(financials.id, body.id))
    .returning();

  return NextResponse.json(updated[0]);
}