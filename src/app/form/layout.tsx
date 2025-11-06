'use client';

import { usePathname } from 'next/navigation';
import { ReportDraftProvider } from '~/components/report-draft-provider';
import ReportFormShell from '~/components/report-form-shell';

export default function FormLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if the current route is the landing page (/form)
  const isLandingPage = pathname === '/form';

  // Skip provider + sidebar on the landing page
  if (isLandingPage) {
    return <>{children}</>;
  }

  // Use shared provider and shell for all other form pages
  return (
    <ReportDraftProvider>
      <ReportFormShell>{children}</ReportFormShell>
    </ReportDraftProvider>
  );
}
