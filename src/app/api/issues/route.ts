import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { issues } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('projectId');
  if (!projectId) return NextResponse.json([], { status: 400 });

  const projectIssues = await db.query.issues.findMany({
    where: eq(issues.projectId, parseInt(projectId)),
  });
  return NextResponse.json(projectIssues);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, resolutionDescription } = body;
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

  await db.update(issues)
    .set({
      status,
      resolutionDescription: resolutionDescription ?? null,
    })
    .where(eq(issues.id, id));

  return NextResponse.json({ success: true });
}
