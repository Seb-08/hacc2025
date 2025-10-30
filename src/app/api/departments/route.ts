import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { departments } from '~/server/db/schema';

export async function GET() {
  const data = await db.select().from(departments);
  return NextResponse.json(data);
}
