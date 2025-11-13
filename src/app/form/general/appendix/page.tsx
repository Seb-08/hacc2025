// src/app/form/general/appendix/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReportDraft } from '~/components/report-draft-provider';

export default function AppendixPage() {
  const {
    draft,
    setDraft,
    deletedScheduleIds,        // 🆕 from context
    clearDeletedScheduleIds,   // 🆕 from context
  } = useReportDraft();

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string>('');

  function updateAppendix(v: string) {
    setDraft((d) => ({ ...d, appendix: { id: d.appendix?.id, content: v } }));
  }

  async function submitAll() {
    setSubmitting(true);
    setMsg('');
    try {
      let reportId = draft.general.id;

      // 1) Create or update the base report
      if (!reportId) {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft.general),
        });
        if (!res.ok) throw new Error('Failed to create report');
        const created = await res.json();
        reportId = created.id;
      } else {
        const res = await fetch(`/api/reports/${reportId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft.general),
        });
        if (!res.ok) throw new Error('Failed to update report');
      }

      // 🗑️ 2) Delete removed milestones FIRST (so they don't get resurrected)
      for (const id of deletedScheduleIds) {
        const delRes = await fetch(`/api/reports/${reportId}/scope-schedule`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!delRes.ok) throw new Error('Failed to delete a milestone');
      }

      // 3) Upsert issues
      for (const issue of draft.issues) {
        const method = issue.id ? 'PUT' : 'POST';
        const endpoint = `/api/reports/${reportId}/issues`;
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...issue, reportId }),
        });
        if (!res.ok) throw new Error('Failed to save issue');
      }

      // 4) Upsert schedule & scope
      for (const row of draft.scheduleScope) {
        const method = row.id ? 'PUT' : 'POST';
        const endpoint = `/api/reports/${reportId}/scope-schedule`;
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...row, reportId }),
        });
        if (!res.ok) throw new Error('Failed to save schedule/scope');
      }

      // 5) Upsert financials
      if (draft.financial) {
        const body = {
          ...draft.financial,
          reportId,
          originalContractAmt: Number(draft.financial.originalContractAmt ?? 0),
          paidToDate: Number(draft.financial.paidToDate ?? 0),
        };
        const method = draft.financial.id ? 'PUT' : 'POST';
        const endpoint = `/api/reports/${reportId}/financials`;
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to save financials');
      }

      // 6) Upsert appendix
      const appendixBody = { ...draft.appendix, reportId, content: draft.appendix?.content ?? '' };
      const method = draft.appendix?.id ? 'PUT' : 'POST';
      const endpoint = `/api/reports/${reportId}/appendix`;
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appendixBody),
      });
      if (!res.ok) throw new Error('Failed to save appendix');

      // 7) Snapshot
      const snap = await fetch(`/api/reports/${reportId}/submit`, { method: 'POST' });
      if (!snap.ok) throw new Error('Failed to snapshot report');

      // 🎉 success — clear pending deletions
      clearDeletedScheduleIds();

      setMsg('✅ Report submitted and version snapshot saved');
    } catch (e: any) {
      setMsg(e?.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Appendix & Submit</h1>
      <p className="text-gray-600 mt-1">
        Add any extra notes. When you submit, we’ll save a versioned snapshot for this month.
      </p>

      <div className="mt-6">
        <label className="text-sm font-medium">Appendix Notes</label>
        <textarea
          rows={8}
          className="w-full mt-1 border rounded-xl px-3 py-2"
          value={draft.appendix?.content ?? ''}
          onChange={(e) => updateAppendix(e.target.value)}
          placeholder="Add any additional info, risks, decisions, or context…"
        />
      </div>

      {msg && <p className="mt-4 text-sm">{msg}</p>}

      <div className="mt-8 flex justify-between">
        <button onClick={() => router.back()} className="px-4 py-2 rounded-lg border">
          Back
        </button>
        <button
          disabled={submitting}
          onClick={submitAll}
          className="px-4 py-2 rounded-lg text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          {submitting ? 'Submitting…' : 'Submit Monthly Report'}
        </button>
      </div>
    </div>
  );
}