// src/app/review/[snapshotId]/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import SnapshotDetailClient from '~/app/review/[snapshotId]/SnapshotDetailClient'

export default async function SnapshotDetailPage({
  params,
}: {
  params: { snapshotId: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  return <SnapshotDetailClient snapshotId={params.snapshotId} />;
}
