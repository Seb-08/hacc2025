import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { issues } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const data = await db.select().from(issues);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [newIssue] = await db.insert(issues).values(body).returning();
  return NextResponse.json(newIssue);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  await db.update(issues).set({ status: body.status }).where(eq(issues.id, body.id));
  return NextResponse.json({ success: true });
}
