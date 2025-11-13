'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { ReportDraftProvider } from '~/components/report-draft-provider';
import ReportFormShell from '~/components/report-form-shell';

export default function FormLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();

  // check current route
  const isLandingPage = pathname === '/form';

  // extract ?id from query string
  const id = search?.get('id');

  // skip provider/shell on landing page
  if (isLandingPage) return <>{children}</>;

  // pass reportId to provider for auto-loading existing reports
  return (
    <ReportDraftProvider reportId={id ?? undefined}>
      <ReportFormShell>{children}</ReportFormShell>
    </ReportDraftProvider>
  );
}