// src/app/form/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import FormLandingClient from './FormLandingClient';

export default async function FormPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    redirect('/');
  }

  return <FormLandingClient />;
}
