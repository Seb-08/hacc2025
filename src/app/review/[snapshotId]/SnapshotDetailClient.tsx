'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  DollarSign,
  FileText,
  Flag,
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import '~/lib/chartSetup';
import { useReactToPrint } from 'react-to-print';
import {
  SignatureModal,
  type SignatureData,
} from '~/components/SignatureModal';

type SnapshotStatus = 'pending' | 'approved' | 'denied';

type ReviewSnapshot = {
  id: number;
  reportId: number;
  snapshotData: string;
  createdAt: string;
  status: SnapshotStatus;

  // Signature metadata from schema (if your API returns these)
  signatureName?: string | null;
  signatureMethod?: string | null;
  signatureUrl?: string | null;
  approvedAt?: string | null;

  // Extra fields from /api/review/snapshots
  reportName: string;
  department: string;
  reportStartDate: string | null;
};

type FullReport = {
  id: number;
  name: string;
  department: string;
  startDate?: string;
  issues?: any[];
  scheduleScope?: any[];
  financials?: any[];
  appendix?: any[];
  submittedAt?: string;
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseSnapshot(snapshotData: string): FullReport | null {
  try {
    return JSON.parse(snapshotData);
  } catch {
    return null;
  }
}

function getStatusConfig(status: SnapshotStatus) {
  switch (status) {
    case 'approved':
      return {
        label: 'Approved Snapshot',
        className:
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-emerald-700 bg-emerald-50',
      };
    case 'denied':
      return {
        label: 'Denied Snapshot',
        className:
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-red-700 bg-red-50',
      };
    default:
      return {
        label: 'Pending Snapshot',
        className:
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-amber-700 bg-amber-50',
      };
  }
}

export default function SnapshotDetailClient({
  snapshotId,
}: {
  snapshotId: string;
}) {
  const router = useRouter();
  const numericId = Number(snapshotId);

  const [snapshots, setSnapshots] = useState<ReviewSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<FullReport | null>(
    null,
  );
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const componentRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: selectedSnapshot?.name
      ? `${selectedSnapshot.name} Snapshot`
      : 'Snapshot',
  });

  // Load all snapshots and focus on the one with this ID
  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      setError('Invalid snapshot ID');
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/review/snapshots', {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Failed to load snapshots');
        }

        const all: ReviewSnapshot[] = await res.json();

        const current = all.find((s) => s.id === numericId);
        if (!current) {
          setError('Snapshot not found');
          setLoading(false);
          return;
        }

        // Filter to only snapshots for the same report
        const sameReport = all.filter(
          (s) => s.reportId === current.reportId,
        );

        const parsed = parseSnapshot(current.snapshotData);
        if (!parsed) {
          setError('Snapshot payload is invalid');
          setLoading(false);
          return;
        }

        setSnapshots(sameReport);
        setSelectedSnapshot(parsed);
        setSelectedSnapshotId(current.id);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? 'Error loading snapshot');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [numericId]);

  const handleSnapshotSelect = (id: number) => {
    const snap = snapshots.find((s) => s.id === id);
    if (!snap) return;

    try {
      const parsed = parseSnapshot(snap.snapshotData);
      if (!parsed) {
        setError('Error parsing snapshot data.');
        return;
      }
      setSelectedSnapshot(parsed);
      setSelectedSnapshotId(snap.id);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error parsing snapshot data.');
    }
  };

  const activeSnapshot =
    (selectedSnapshotId &&
      snapshots.find((s) => s.id === selectedSnapshotId)) ||
    snapshots[0];

  const handleOpenSignature = () => {
    if (!activeSnapshot) return;
    setApprovingId(activeSnapshot.id);
    setShowSignatureModal(true);
    setActionMessage('');
  };

  async function handleSignatureSave(signature: SignatureData) {
    if (!approvingId) return;
    setShowSignatureModal(false);
    setActionMessage('');
    try {
      const res = await fetch(
        `/api/review/snapshots/${approvingId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve snapshot');
      }

      setActionMessage('✅ Snapshot approved with signature attached');

      // Update local state
      setSnapshots((prev) =>
        prev.map((s) =>
          s.id === approvingId ? { ...s, status: 'approved' } : s,
        ),
      );
      setApprovingId(null);
    } catch (err: any) {
      console.error(err);
      setActionMessage(err?.message ?? 'Error approving snapshot');
      setApprovingId(null);
    }
  }

  async function handleDeny() {
    if (!activeSnapshot) return;
    setActionMessage('');
    try {
      const res = await fetch(
        `/api/review/snapshots/${activeSnapshot.id}/deny`,
        {
          method: 'POST',
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deny snapshot');
      }
      setActionMessage('❌ Snapshot denied');
      setSnapshots((prev) =>
        prev.map((s) =>
          s.id === activeSnapshot.id ? { ...s, status: 'denied' } : s,
        ),
      );
    } catch (err: any) {
      console.error(err);
      setActionMessage(err?.message ?? 'Error denying snapshot');
    }
  }

  async function handleRemove() {
    if (!activeSnapshot) return;
    setActionMessage('');
    try {
      const res = await fetch(
        `/api/review/snapshots/${activeSnapshot.id}`,
        {
          method: 'DELETE',
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove snapshot');
      }
      setActionMessage('🗑️ Snapshot removed');
      router.push('/review');
    } catch (err: any) {
      console.error(err);
      setActionMessage(err?.message ?? 'Error removing snapshot');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p className="text-gray-600">Loading snapshot…</p>
      </main>
    );
  }

  if (error || !selectedSnapshot || !activeSnapshot) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => router.push('/review')}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Review Queue
        </button>
        <p className="text-sm text-red-600">
          {error || 'Unable to load this snapshot.'}
        </p>
      </main>
    );
  }

  const {
    name,
    department,
    startDate,
    issues = [],
    scheduleScope = [],
    financials = [],
    appendix = [],
    submittedAt,
  } = selectedSnapshot;

  const financialData = financials[0];

  // Snapshot meta
  const snapshotTakenDate = activeSnapshot.createdAt || submittedAt || '';

  // ========= CHART DATA HELPERS =========

  // 💰 Financial bar chart (support both old + new field names)
  const chartData: ChartData<'bar'> | null = financialData
    ? {
        labels: ['Original Contract', 'Paid to Date'],
        datasets: [
          {
            label: 'Amount ($)',
            data: [
              Number(
                financialData.originalContractAmt ??
                  financialData.originalContractAmount ??
                  0,
              ),
              Number(
                financialData.paidToDate ??
                  financialData.totalPaid ??
                  0,
              ),
            ],
            backgroundColor: ['rgba(54,162,235,0.7)', 'rgba(75,192,192,0.7)'],
            borderColor: ['rgba(54,162,235,1)', 'rgba(75,192,192,1)'],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            typeof value === 'number'
              ? `$${value.toLocaleString()}`
              : `$${value}`,
        },
      },
      x: { type: 'category' },
    },
  };

  // 📅 1. Schedule timeline – horizontal bar (x = days until target date)
  const scheduleTimelineData: ChartData<'bar'> | null = (() => {
    if (!scheduleScope?.length) return null;

    const rowsWithDate = scheduleScope.filter((row: any) => row.targetDate);
    if (!rowsWithDate.length) return null;

    const referenceDate =
      (activeSnapshot.createdAt && new Date(activeSnapshot.createdAt)) ||
      (submittedAt && new Date(submittedAt)) ||
      new Date();

    if (Number.isNaN(referenceDate.getTime())) return null;

    const dayMs = 1000 * 60 * 60 * 24;

    const labels = rowsWithDate.map(
      (row: any, i: number) => row.task || `Milestone ${i + 1}`,
    );

    const data = rowsWithDate.map((row: any) => {
      const target = new Date(row.targetDate);
      if (Number.isNaN(target.getTime())) return 0;
      return Math.round((target.getTime() - referenceDate.getTime()) / dayMs);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Days until target date',
          data,
          backgroundColor: 'rgba(59,130,246,0.6)',
          borderColor: 'rgba(59,130,246,1)',
          borderWidth: 1,
        },
      ],
    };
  })();

  const scheduleTimelineOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.raw} day${ctx.raw === 1 ? '' : 's'} until target date`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Days until target date (negative = past due)',
        },
      },
      y: {
        title: {
          display: false,
        },
      },
    },
  };

  // 📊 2. Scope completion – horizontal bar (% complete)
  const scopeCompletionData: ChartData<'bar'> | null = (() => {
    if (!scheduleScope?.length) return null;

    const labels = scheduleScope.map(
      (row: any, i: number) => row.task || `Milestone ${i + 1}`,
    );
    const data = scheduleScope.map((row: any) =>
      Number.isFinite(Number(row.completionPercent))
        ? Number(row.completionPercent)
        : 0,
    );

    return {
      labels,
      datasets: [
        {
          label: 'Completion (%)',
          data,
          backgroundColor: 'rgba(16,185,129,0.6)',
          borderColor: 'rgba(16,185,129,1)',
          borderWidth: 1,
        },
      ],
    };
  })();

  const scopeCompletionOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw}% complete`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Completion (%)',
        },
      },
      y: {
        title: { display: false },
      },
    },
  };

  // 🥧 3. Issues status – pie (Open vs Closed)
  const issuesStatusPieData: ChartData<'pie'> | null = (() => {
    if (!issues?.length) return null;

    const closed = issues.filter(
      (issue: any) =>
        String(issue.status || '').toUpperCase() === 'CLOSED',
    ).length;
    const open = issues.length - closed;

    if (open === 0 && closed === 0) return null;

    return {
      labels: ['Open Issues', 'Closed Issues'],
      datasets: [
        {
          data: [open, closed],
          backgroundColor: [
            'rgba(239,68,68,0.8)',
            'rgba(34,197,94,0.8)',
          ],
          borderColor: ['rgba(239,68,68,1)', 'rgba(34,197,94,1)'],
          borderWidth: 1,
        },
      ],
    };
  })();

  const issuesStatusPieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  // 🥧 4. Milestone completion – pie (100% vs <100%)
  const milestonesCompletionPieData: ChartData<'pie'> | null = (() => {
    if (!scheduleScope?.length) return null;

    let completed = 0;
    let notCompleted = 0;

    for (const row of scheduleScope) {
      const pct = Number(row.completionPercent ?? 0);
      if (pct >= 100) completed += 1;
      else notCompleted += 1;
    }

    if (completed === 0 && notCompleted === 0) return null;

    return {
      labels: ['Completed Milestones', 'Incomplete Milestones'],
      datasets: [
        {
          data: [completed, notCompleted],
          backgroundColor: [
            'rgba(34,197,94,0.8)',
            'rgba(251,191,36,0.8)',
          ],
          borderColor: ['rgba(34,197,94,1)', 'rgba(251,191,36,1)'],
          borderWidth: 1,
        },
      ],
    };
  })();

  const milestonesCompletionPieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const statusConfig = getStatusConfig(activeSnapshot.status);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Top bar: back + PDF export */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/review')}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Review Queue
        </button>
        <button
          onClick={handlePrint}
          className="rounded-md bg-[#2FB8AC] px-4 py-2 text-sm text-white shadow hover:bg-[#00796B]"
        >
          Export as PDF
        </button>
      </div>

      {actionMessage && (
        <p className="mb-3 text-sm font-medium text-emerald-700">
          {actionMessage}
        </p>
      )}

      {/* Main content wrapper (this is what prints) */}
      <div className="space-y-10 rounded-2xl bg-transparent p-0" ref={componentRef}>
        {/* Header & Signature & Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              {name || activeSnapshot.reportName || 'Untitled Report'}
            </h1>
            <p className="mt-1 text-gray-600">
              Department:{' '}
              <span className="font-medium">
                {department || activeSnapshot.department || '—'}
              </span>{' '}
              · Start:{' '}
              {startDate
                ? formatDate(startDate)
                : formatDate(activeSnapshot.reportStartDate)}
            </p>

            {/* Snapshot selector (all snapshots for same report) */}
            {snapshots.length > 1 && (
              <div className="mt-4">
                <label className="mb-1 block text-xs text-gray-600">
                  📅 View other snapshots for this report:
                </label>
                <select
                  value={selectedSnapshotId ?? activeSnapshot.id}
                  onChange={(e) =>
                    handleSnapshotSelect(Number(e.target.value))
                  }
                  className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-teal-500"
                >
                  {snapshots.map((snap) => (
                    <option key={snap.id} value={snap.id}>
                      {formatDate(snap.createdAt)} · {snap.status}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Status pill */}
            <span className={statusConfig.className}>
              {activeSnapshot.status === 'approved' && (
                <CheckCircle2 className="h-3 w-3" />
              )}
              {statusConfig.label}
            </span>

            {/* Review actions */}
            <div className="flex flex-wrap justify-end gap-2">
              {activeSnapshot.status === 'pending' && (
                <>
                  <button
                    onClick={handleOpenSignature}
                    className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Approve &amp; Sign
                  </button>
                  <button
                    onClick={handleDeny}
                    className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600"
                  >
                    Deny
                  </button>
                </>
              )}

              {activeSnapshot.status === 'denied' && (
                <button
                  onClick={handleOpenSignature}
                  className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Approve &amp; Sign
                </button>
              )}

              {activeSnapshot.status === 'approved' && (
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600"
                >
                  Remove Snapshot
                </button>
              )}
            </div>

            {/* Signature / Approval badge (if already signed) */}
            {activeSnapshot.signatureUrl && activeSnapshot.signatureName && (
              <div className="mt-1 flex w-[260px] flex-col items-end gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Approved Snapshot
                </div>
                <p className="text-[10px] text-gray-500">
                  Signed by{' '}
                  <span className="font-semibold text-gray-800">
                    {activeSnapshot.signatureName}
                  </span>
                  {activeSnapshot.approvedAt && (
                    <>
                      {' '}
                      on{' '}
                      <span className="text-gray-700">
                        {formatDate(activeSnapshot.approvedAt)}
                      </span>
                    </>
                  )}
                </p>
                <div className="mt-1 flex w-full justify-end">
                  <div className="flex max-h-[52px] max-w-[150px] items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-1">
                    <img
                      src={activeSnapshot.signatureUrl}
                      alt="Approver signature"
                      className="max-h-12 w-auto object-contain opacity-90"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 Top Summary Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* General Info */}
          <div className="flex flex-col items-start rounded-xl border bg-white p-6 shadow-sm">
            <Flag className="mb-3 text-teal-600" />
            <h2 className="mb-1 text-lg font-semibold">
              General Information
            </h2>
            <p className="text-sm text-gray-600">
              Department: {department || activeSnapshot.department || '—'}
            </p>
            <p className="text-sm text-gray-600">
              Start Date:{' '}
              {startDate
                ? formatDate(startDate)
                : formatDate(activeSnapshot.reportStartDate)}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Snapshot Taken: {formatDate(snapshotTakenDate)}
            </p>
          </div>

          {/* Financial Summary (wide) */}
          <div className="flex flex-col rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="text-green-600" />
              <h2 className="text-lg font-semibold">Financial Summary</h2>
            </div>

            {financialData ? (
              <div className="flex flex-col items-stretch gap-6 md:flex-row">
                <div className="flex-1">
                  <p className="mb-1 text-sm text-gray-600">
                    Original Contract:{' '}
                    <span className="font-semibold">
                      $
                      {Number(
                        financialData.originalContractAmt ??
                          financialData.originalContractAmount ??
                          0,
                      ).toLocaleString()}
                    </span>
                  </p>
                  <p className="mb-3 text-sm text-gray-600">
                    Paid to Date:{' '}
                    <span className="font-semibold">
                      $
                      {Number(
                        financialData.paidToDate ??
                          financialData.totalPaid ??
                          0,
                      ).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    This chart compares the total contract value with payments
                    made to date for a quick snapshot of financial health.
                  </p>
                </div>
                <div className="flex flex-1 items-center">
                  {chartData && (
                    <div className="h-56 w-full">
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No financial data.</p>
            )}
          </div>
        </div>

        {/* 🔹 Top Pie Charts Row (side by side) */}
        {(issuesStatusPieData || milestonesCompletionPieData) && (
          <div className="grid gap-6 md:grid-cols-2">
            {issuesStatusPieData && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Issue Status Overview
                </h3>
                <p className="mb-3 text-xs text-gray-500">
                  Distribution of open vs closed issues in this snapshot.
                </p>
                <div className="mx-auto h-64">
                  <Pie
                    data={issuesStatusPieData}
                    options={issuesStatusPieOptions}
                  />
                </div>
              </div>
            )}

            {milestonesCompletionPieData && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Milestone Completion Overview
                </h3>
                <p className="mb-3 text-xs text-gray-500">
                  Completed milestones are those at 100% completion.
                </p>
                <div className="mx-auto h-64">
                  <Pie
                    data={milestonesCompletionPieData}
                    options={milestonesCompletionPieOptions}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🔹 Issues */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <ClipboardList className="text-indigo-600" /> All Issues
          </h2>
          {!issues.length ? (
            <p className="text-gray-500">No issues recorded.</p>
          ) : (
            <div className="grid gap-4">
              {issues.map((issue: any, i: number) => (
                <div
                  key={issue.id ?? i}
                  className="rounded-lg border bg-gray-50 p-4"
                >
                  <h3 className="mb-1 font-medium text-gray-800">
                    Issue {i + 1}: {issue.description || 'No description'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Impact: {issue.impact} · Likelihood: {issue.likelihood} ·
                    Risk: {issue.overallRisk ?? 0}/6
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Recommendation: {issue.recommendation || '—'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Status: {issue.status} · Start:{' '}
                    {issue.startDate ? formatDate(issue.startDate) : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔹 Schedule & Scope */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Calendar className="text-amber-600" /> Schedule &amp; Scope
          </h2>
          {!scheduleScope.length ? (
            <p className="text-gray-500">No milestones recorded.</p>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-t text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Task</th>
                      <th className="px-3 py-2 text-left">Target Date</th>
                      <th className="px-3 py-2 text-left">% Complete</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleScope.map((row: any, i: number) => (
                      <tr
                        key={row.id ?? i}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">{row.task}</td>
                        <td className="px-3 py-2">
                          {row.targetDate ? formatDate(row.targetDate) : '—'}
                        </td>
                        <td className="px-3 py-2">
                          {row.completionPercent ?? 0}%
                        </td>
                        <td className="px-3 py-2">{row.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charts row */}
              <div className="grid gap-6 lg:grid-cols-2">
                {scheduleTimelineData && (
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">
                      Schedule Timeline
                    </h3>
                    <p className="mb-3 text-xs text-gray-500">
                      Days until each milestone target date.
                    </p>
                    <div className="h-72">
                      <Bar
                        data={scheduleTimelineData}
                        options={scheduleTimelineOptions}
                      />
                    </div>
                  </div>
                )}

                {scopeCompletionData && (
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">
                      Scope Completion by Milestone
                    </h3>
                    <p className="mb-3 text-xs text-gray-500">
                      Shows completion percentage for each milestone.
                    </p>
                    <div className="h-72">
                      <Bar
                        data={scopeCompletionData}
                        options={scopeCompletionOptions}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 🔹 Appendix */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <FileText className="text-purple-600" /> Appendix
          </h2>
          {!appendix[0]?.content ? (
            <p className="text-gray-500">No appendix notes provided.</p>
          ) : (
            <p className="whitespace-pre-wrap text-gray-700">
              {appendix[0].content}
            </p>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => {
          setShowSignatureModal(false);
          setApprovingId(null);
        }}
        onSave={handleSignatureSave}
      />
    </main>
  );
}
