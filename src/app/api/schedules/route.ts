import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { schedules } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) return NextResponse.json([]);

  const data = await db.select().from(schedules).where(eq(schedules.projectId, parseInt(projectId)));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [newSchedule] = await db.insert(schedules).values(body).returning();
  return NextResponse.json(newSchedule);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, completed } = body;

  if (!id) return NextResponse.json({ error: 'Missing schedule ID' }, { status: 400 });

  const updateData: any = {};
  if (status) updateData.status = status;
  if (completed !== undefined) updateData.completed = completed;
  if (completed || status === 'closed') updateData.dateClosed = new Date();
  else updateData.dateClosed = null;

  await db.update(schedules).set(updateData).where(eq(schedules.id, id));

  return NextResponse.json({ success: true });
}
