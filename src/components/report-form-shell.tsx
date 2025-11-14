'use client';

import ReportSideNav from './report-side-nav';

export default function ReportFormShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-8">
      <ReportSideNav />
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm border p-6">{children}</div>
      </div>
    </div>
  );
}