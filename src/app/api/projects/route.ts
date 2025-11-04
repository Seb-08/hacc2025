import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { projects } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const departmentId = req.nextUrl.searchParams.get('departmentId');
  if (!departmentId) return NextResponse.json([], { status: 400 });

  const departmentProjects = await db.query.projects.findMany({
    where: eq(projects.departmentId, parseInt(departmentId)),
  });

  return NextResponse.json(departmentProjects);
}