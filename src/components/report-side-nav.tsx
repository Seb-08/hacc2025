'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReportDraft } from './report-draft-provider';
import { useMemo } from 'react';

const baseItems = [
  { label: 'General', href: '/form/general' },
  { label: 'Issues', href: '/form/general/issues' },
  { label: 'Schedule & Scope', href: '/form/general/schedule' },
  { label: 'Financials', href: '/form/general/financial' },
  { label: 'Appendix & Submit', href: '/form/general/appendix' },
];

export default function ReportSideNav() {
  const pathname = usePathname();
  const { draft } = useReportDraft();

  // Build dynamic links for each issue
  const issueLinks = useMemo(() => {
    if (!draft.issues?.length) return [];
    return draft.issues.map((issue, idx) => ({
      label: issue.description ? truncate(issue.description, 28) : `Issue ${idx + 1}`,
      href: `/form/general/issues/${idx}`,
    }));
  }, [draft]);

  return (
    <aside className="w-72 shrink-0">
      <div className="rounded-2xl border shadow-sm p-4 sticky top-[116px] bg-white">
        <h3 className="text-sm font-semibold tracking-wide text-[#006D68] uppercase">Report Builder</h3>
        <nav className="mt-4 flex flex-col gap-1">
          {baseItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm transition
                ${pathname === item.href ? 'bg-[#E6F6F4] text-[#006D68] font-semibold' : 'hover:bg-gray-50'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {issueLinks.length > 0 && (
          <>
            <div className="h-px bg-gray-200 my-4" />
            <h4 className="text-xs font-semibold uppercase text-gray-500">Issues</h4>
            <nav className="mt-2 flex flex-col gap-1">
              {issueLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${
                    pathname === item.href ? 'text-[#006D68] font-semibold' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
    </aside>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
