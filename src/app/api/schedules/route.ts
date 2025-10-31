import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { schedules } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const data = await db.select().from(schedules);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [newSchedule] = await db.insert(schedules).values(body).returning();
  return NextResponse.json(newSchedule);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  await db.update(schedules).set({ status: body.status }).where(eq(schedules.id, body.id));
  return NextResponse.json({ success: true });
}
