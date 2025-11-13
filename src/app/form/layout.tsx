// src/app/form/layout.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '~/lib/auth';
import type { ReactNode } from 'react';
import FormLayoutClient from './FormLayoutClient';

export default async function FormLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    redirect('/');
  }

  return <FormLayoutClient>{children}</FormLayoutClient>;
}