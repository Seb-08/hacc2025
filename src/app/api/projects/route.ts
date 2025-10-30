import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { projects } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get('departmentId');

  if (!departmentId) return NextResponse.json([]);

  const data = await db.select().from(projects).where(eq(projects.departmentId, parseInt(departmentId)));
  return NextResponse.json(data);
}
