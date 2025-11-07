// src/app/reveiw/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Flag,
  Calendar,
  ListChecks,
  DollarSign,
  ClipboardList,
} from 'lucide-react';

type PendingSnapshot = {
  id: number;
  reportId: number;
  status: 'pending';
  createdAt: string;
  snapshotData: string;
  reportName: string;
  department: string;
  reportStartDate: string | null;
};

type ParsedSnapshotSummary = {
  issuesCount: number;
  milestonesCount: number;
  hasFinancials: boolean;
  hasAppendix: boolean;
};

type ParsedSnapshot = {
  name?: string;
  department?: string;
  startDate?: string;
  issues?: any[];
  scheduleScope?: any[];
  financials?: any[];
  appendix?: any[];
  submittedAt?: string;
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function summarizeSnapshot(snapshotData: string): ParsedSnapshotSummary {
  try {
    const parsed = JSON.parse(snapshotData);

    const issuesCount = Array.isArray(parsed.issues) ? parsed.issues.length : 0;
    const milestonesCount = Array.isArray(parsed.scheduleScope)
      ? parsed.scheduleScope.length
      : 0;
    const hasFinancials =
      Array.isArray(parsed.financials) && parsed.financials.length > 0;
    const hasAppendix =
      Array.isArray(parsed.appendix) &&
      parsed.appendix[0] &&
      !!parsed.appendix[0].content;

    return {
      issuesCount,
      milestonesCount,
      hasFinancials,
      hasAppendix,
    };
  } catch {
    return {
      issuesCount: 0,
      milestonesCount: 0,
      hasFinancials: false,
      hasAppendix: false,
    };
  }
}

function parseSnapshot(snapshotData: string): ParsedSnapshot | null {
  try {
    return JSON.parse(snapshotData);
  } catch {
    return null;
  }
}

export default function ReviewSnapshotsPage() {
  const [snapshots, setSnapshots] = useState<PendingSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  async function loadPending() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/review/snapshots', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load pending snapshots');
      const data = await res.json();
      setSnapshots(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Error loading queue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPending();
  }, []);

  async function handleApprove(id: number) {
    setActionMessage('');
    try {
      const res = await fetch(`/api/review/snapshots/${id}/approve`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to approve snapshot');
      setActionMessage('✅ Snapshot approved');
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err: any) {
      console.error(err);
      setActionMessage(err?.message ?? 'Error approving snapshot');
    }
  }

  async function handleDeny(id: number) {
    setActionMessage('');
    try {
      const res = await fetch(`/api/review/snapshots/${id}/deny`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to deny snapshot');
      setActionMessage('❌ Snapshot denied');
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err: any) {
      console.error(err);
      setActionMessage(err?.message ?? 'Error denying snapshot');
    }
  }

  const selectedSnapshot = snapshots.find((s) => s.id === selectedId);
  const selectedSummary = selectedSnapshot
    ? summarizeSnapshot(selectedSnapshot.snapshotData)
    : null;
  const parsed = selectedSnapshot
    ? parseSnapshot(selectedSnapshot.snapshotData)
    : null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#002C3E]">
          Snapshot Review Queue
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Review submitted monthly snapshots before they become visible on the public
          reports page. Only <span className="font-semibold">approved</span> snapshots
          are displayed to viewers.
        </p>
        {actionMessage && (
          <p className="text-sm mt-1 text-emerald-700 font-medium">
            {actionMessage}
          </p>
        )}
        {error && (
          <p className="text-sm mt-1 text-red-600 font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Empty state */}
      {!loading && snapshots.length === 0 && (
        <div className="mt-6 p-6 bg-white border rounded-2xl shadow-sm text-center text-gray-500">
          <Clock className="mx-auto mb-2 text-gray-400" />
          <p>No pending snapshots at the moment.</p>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
        {/* Left: Pending list */}
        <section className="space-y-3">
          {loading ? (
            <p className="text-gray-600">Loading pending snapshots...</p>
          ) : (
            snapshots.map((snap) => {
              const summary = summarizeSnapshot(snap.snapshotData);
              return (
                <button
                  key={snap.id}
                  onClick={() => setSelectedId(snap.id)}
                  className={`w-full text-left p-4 rounded-2xl border shadow-sm bg-white transition hover:shadow-md ${
                    selectedId === snap.id
                      ? 'border-[#2FA8A3] ring-1 ring-[#2FA8A3]/40'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-amber-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending Snapshot
                      </p>
                      <h2 className="text-sm font-semibold text-[#002C3E] mt-1 line-clamp-2">
                        {snap.reportName || 'Untitled Report'}
                      </h2>
                      <p className="text-[10px] text-gray-500">
                        Dept: {snap.department || '—'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Report Start: {formatDate(snap.reportStartDate)}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-gray-500">
                      Submitted: {formatDate(snap.createdAt)}
                      <div className="mt-1 text-[9px] text-gray-500">
                        {summary.issuesCount} issues · {summary.milestonesCount} milestones
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </section>

        {/* Right: Preview & Actions */}
        <section className="bg-white border rounded-2xl shadow-sm p-5 min-h-[260px]">
          {!selectedSnapshot || !parsed ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm">
              <FileText className="w-6 h-6 mb-2 text-gray-400" />
              <p>Select a snapshot on the left to review its contents.</p>
            </div>
          ) : (
            <>
              {/* Header + buttons */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-amber-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Approval
                  </p>
                  <h2 className="text-lg font-semibold text-[#002C3E]">
                    {selectedSnapshot.reportName || parsed.name || 'Untitled Report'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Dept: {selectedSnapshot.department || parsed.department || '—'} ·
                    Report ID: {selectedSnapshot.reportId}
                  </p>
                  <p className="text-xs text-gray-500">
                    Snapshot Submitted: {formatDate(selectedSnapshot.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleApprove(selectedSnapshot.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDeny(selectedSnapshot.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-red-500 text-white hover:bg-red-600"
                  >
                    <XCircle className="w-3 h-3" />
                    Deny
                  </button>
                </div>
              </div>

              {/* Quick summary metrics */}
              {selectedSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-teal-600" />
                    <div>
                      <p className="font-semibold">
                        {selectedSummary.issuesCount}
                      </p>
                      <p className="text-gray-500">Issues</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="font-semibold">
                        {selectedSummary.milestonesCount}
                      </p>
                      <p className="text-gray-500">Milestones</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-semibold">
                        {selectedSummary.hasFinancials ? 'Yes' : 'No'}
                      </p>
                      <p className="text-gray-500">Financials</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-semibold">
                        {selectedSummary.hasAppendix ? 'Yes' : 'No'}
                      </p>
                      <p className="text-gray-500">Appendix</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Snapshot Preview - styled like public view, but constrained */}
              <div className="mt-3 border-t pt-3 space-y-4 max-h-[460px] overflow-y-auto">
                {/* General Info */}
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Flag className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      General Information
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600">
                    Name:{' '}
                    <span className="font-medium">
                      {parsed.name || selectedSnapshot.reportName || 'Untitled Report'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Department:{' '}
                    <span className="font-medium">
                      {parsed.department || selectedSnapshot.department || '—'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Start Date:{' '}
                    {formatDate(parsed.startDate || selectedSnapshot.reportStartDate)}
                  </p>
                </div>

                {/* Financials */}
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Financial Summary
                    </h3>
                  </div>
                  {Array.isArray(parsed.financials) && parsed.financials[0] ? (
                    <>
                      <p className="text-xs text-gray-600">
                        Original Contract:{' '}
                        <span className="font-semibold">
                          $
                          {Number(
                            parsed.financials[0].originalContractAmt ?? 0,
                          ).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600">
                        Paid to Date:{' '}
                        <span className="font-semibold">
                          $
                          {Number(
                            parsed.financials[0].paidToDate ?? 0,
                          ).toLocaleString()}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">No financial data.</p>
                  )}
                </div>

                {/* Issues */}
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Issues
                    </h3>
                  </div>
                  {!Array.isArray(parsed.issues) || parsed.issues.length === 0 ? (
                    <p className="text-xs text-gray-500">No issues recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {parsed.issues.slice(0, 3).map((issue: any, i: number) => (
                        <div
                          key={issue.id ?? i}
                          className="border rounded-lg p-2 bg-white"
                        >
                          <p className="text-xs font-semibold text-gray-800">
                            Issue {i + 1}:{' '}
                            {issue.description || 'No description'}
                          </p>
                          <p className="text-[10px] text-gray-600">
                            Impact: {issue.impact} · Likelihood:{' '}
                            {issue.likelihood} · Risk:{' '}
                            {issue.overallRisk ?? 0}/10
                          </p>
                        </div>
                      ))}
                      {parsed.issues.length > 3 && (
                        <p className="text-[10px] text-gray-500">
                          + {parsed.issues.length - 3} more issue(s)…
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Schedule & Scope
                    </h3>
                  </div>
                  {!Array.isArray(parsed.scheduleScope) ||
                  parsed.scheduleScope.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      No milestones recorded.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {parsed.scheduleScope.slice(0, 3).map((row: any, i: number) => (
                        <div
                          key={row.id ?? i}
                          className="flex justify-between text-[10px] bg-white rounded-md px-2 py-1"
                        >
                          <span className="font-medium">
                            {row.task || 'Untitled'}
                          </span>
                          <span className="text-gray-500">
                            {row.targetDate
                              ? formatDate(row.targetDate)
                              : '—'}{' '}
                            · {row.completionPercent ?? 0}%
                          </span>
                        </div>
                      ))}
                      {parsed.scheduleScope.length > 3 && (
                        <p className="text-[10px] text-gray-500">
                          + {parsed.scheduleScope.length - 3} more milestone(s)…
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Appendix */}
                <div className="border rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Appendix
                    </h3>
                  </div>
                  {Array.isArray(parsed.appendix) &&
                  parsed.appendix[0]?.content ? (
                    <p className="text-[10px] text-gray-700 line-clamp-3">
                      {parsed.appendix[0].content}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No appendix notes provided.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
