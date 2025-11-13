import { NextResponse } from 'next/server';
import { getCurrentUser } from '~/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json(
    { user: user ?? null },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    },
  );
}