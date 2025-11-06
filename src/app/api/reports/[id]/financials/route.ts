import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { financials } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const reportId = Number(params.id);
  const body = await req.json();
  const created = await db.insert(financials).values({ ...body, reportId }).returning();
  return NextResponse.json(created[0]);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  await db.update(financials).set(body).where(eq(financials.id, body.id));
  return NextResponse.json({ success: true });
}
