// src/app/review/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import ReviewSnapshotsClient from './ReviewSnapshotsClient';

export default async function ReviewPage() {
  const user = await getCurrentUser();

  // Only admins can access review page
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  return <ReviewSnapshotsClient />;
}
