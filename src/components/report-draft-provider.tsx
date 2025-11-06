'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// ---- Types (loosened to fix TS2322 errors) ----
type DraftIssue = {
  id?: number;
  description?: string;
  startDate?: string;
  impact?: 'low' | 'medium' | 'high';
  likelihood?: 'low' | 'medium' | 'high';
  overallRisk?: number;
  recommendation?: string;
  status?: 'open' | 'closed';
};

type DraftSchedule = {
  id?: number;
  task?: string;
  startDate?: string;
  endDate?: string;
  completionPercent?: number;
  notes?: string;
};

type DraftFinancials = {
  id?: number;
  originalContractAmt?: number | string;
  paidToDate?: number | string;
};

type DraftAppendix = {
  id?: number;
  content?: string;
};

type DraftGeneral = {
  id?: number;
  name?: string;
  department?: string;
  startDate?: string;
};

type ReportDraft = {
  general: DraftGeneral;
  issues: DraftIssue[];
  scheduleScope: DraftSchedule[];
  financial?: DraftFinancials;
  appendix?: DraftAppendix;
};

type Ctx = {
  draft: ReportDraft;
  setDraft: React.Dispatch<React.SetStateAction<ReportDraft>>;
  loadExisting: (id: number | string) => Promise<void>;
  isLoading: boolean;
};

// ---- Context ----
const ReportDraftContext = createContext<Ctx | null>(null);

export function useReportDraft() {
  const ctx = useContext(ReportDraftContext);
  if (!ctx) throw new Error('useReportDraft must be used within ReportDraftProvider');
  return ctx;
}

// ---- Provider ----
export function ReportDraftProvider({
  children,
  reportId,
}: {
  children: React.ReactNode;
  reportId?: string | number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<ReportDraft>({
    general: { name: '', department: '', startDate: '' },
    issues: [],
    scheduleScope: [],
    financial: undefined,
    appendix: undefined,
  });

  async function loadExisting(id: number | string) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('failed to load report');
      const data = await res.json();

      setDraft({
        general: {
          id: data.id,
          name: data.name ?? '',
          department: data.department ?? '',
          startDate: data.startDate ?? '',
        },
        issues: (data.issues ?? []).map((i: any) => ({
          id: i.id,
          description: i.description ?? '',
          startDate: i.startDate ?? '',
          impact: i.impact ?? 'low',
          likelihood: i.likelihood ?? 'low',
          overallRisk: i.overallRisk ?? 0,
          recommendation: i.recommendation ?? '',
          status: i.status ?? 'open',
        })),
        scheduleScope: (data.scheduleScope ?? []).map((s: any) => ({
          id: s.id,
          task: s.task ?? '',
          startDate: s.startDate ?? '',
          endDate: s.endDate ?? '',
          completionPercent: Number(s.completionPercent ?? 0),
          notes: s.notes ?? '',
        })),
        financial: data.financials?.[0]
          ? {
              id: data.financials[0].id,
              originalContractAmt: data.financials[0].originalContractAmt ?? 0,
              paidToDate: data.financials[0].paidToDate ?? 0,
            }
          : undefined,
        appendix:
          data.appendix?.[0] && {
            id: data.appendix[0].id,
            content: data.appendix[0].content ?? '',
          },
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (reportId) void loadExisting(reportId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const value = useMemo(() => ({ draft, setDraft, loadExisting, isLoading }), [draft, isLoading]);

  return <ReportDraftContext.Provider value={value}>{children}</ReportDraftContext.Provider>;
}
