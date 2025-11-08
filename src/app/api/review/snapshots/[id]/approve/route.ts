// src/app/api/review/snapshots/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { reportSnapshots } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const snapshotId = Number(id);
    if (Number.isNaN(snapshotId)) {
      return NextResponse.json(
        { error: 'Invalid snapshot ID' },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const signature = body?.signature;

    if (
      !signature ||
      !signature.name ||
      !signature.method ||
      (signature.method === 'upload' && !signature.imageUrl) &&
      (signature.method === 'draw' && !signature.imageDataUrl)
    ) {
      return NextResponse.json(
        { error: 'Missing signer name or signature image.' },
        { status: 400 },
      );
    }

    const imageUrl: string | null =
      signature.imageUrl || signature.imageDataUrl || null;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing signature image.' },
        { status: 400 },
      );
    }

    // Ensure snapshot exists & is pending
    const existing = await db
      .select()
      .from(reportSnapshots)
      .where(eq(reportSnapshots.id, snapshotId))
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json(
        { error: 'Snapshot not found' },
        { status: 404 },
      );
    }

    if (existing[0].status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending snapshots can be approved' },
        { status: 400 },
      );
    }

    // ✅ Update snapshot: approve + store signature metadata
    await db
      .update(reportSnapshots)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        // add these columns in schema if not present yet:
        // signerName: signature.name,
        // signerMethod: signature.method,
        // signatureUrl: imageUrl,
      } as any)
      .where(
        and(
          eq(reportSnapshots.id, snapshotId),
          eq(reportSnapshots.status, 'pending'),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Approve snapshot error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to approve snapshot' },
      { status: 500 },
    );
  }
}
