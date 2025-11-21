// src/app/review/[snapshotId]/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import SnapshotDetailClient from './SnapshotDetailClient';

export default async function SnapshotDetailPage({
  params,
}: any) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  // Make sure we always end up with a plain string
  const raw = Array.isArray(params?.snapshotId)
    ? params.snapshotId[0]
    : params?.snapshotId;

  const snapshotId = String(raw);

  return <SnapshotDetailClient snapshotId={snapshotId} />;
}
