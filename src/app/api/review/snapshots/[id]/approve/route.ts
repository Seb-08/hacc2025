// src/app/api/review/snapshots/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { reportSnapshots, users } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateEngagespotClient } from '@engagespot/node';


const engagespot = new CreateEngagespotClient({
  apiKey: process.env.ENGAGESPOT_API_KEY!,
  apiSecret: process.env.ENGAGESPOT_API_SECRET!,
});

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
      ((signature.method === 'upload' && !signature.imageUrl) &&
        (signature.method === 'draw' && !signature.imageDataUrl))
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

    // ✅ Ensure snapshot exists & is pending
    const existing = await db
      .select()
      .from(reportSnapshots)
      .where(eq(reportSnapshots.id, snapshotId))
      .limit(1);

    const snapshot = existing[0]; // ✅ define snapshot properly

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Snapshot not found' },
        { status: 404 },
      );
    }

    if (snapshot.status !== 'pending') {
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
        signatureName: signature.name,
        signatureMethod: signature.method,
        signatureUrl: imageUrl,
      } as any)
      .where(
        and(
          eq(reportSnapshots.id, snapshotId),
          eq(reportSnapshots.status, 'pending'),
        ),
      );

     try {
      const res = await engagespot.send({
        notification: {
          title: "Report Approved ✅",
          message: "Your report has been approved by ETS.",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/reports/view/${snapshot.reportId}`,
        },
        sendTo: {
          recipients: ["vendor@example.com"], 
        },
      });
      console.log("✅ Engagespot notification sent to demo vendor:", res);
    } catch (err) {
      console.error("❌ Engagespot send failed for demo vendor", err);
    } 

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Approve snapshot error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to approve snapshot' },
      { status: 500 },
    );
  }
}
