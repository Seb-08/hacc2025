'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Calendar,
  DollarSign,
  FileText,
  Flag,
  ClipboardList,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import '~/lib/chartSetup';
import { useReactToPrint } from 'react-to-print';

// Matches your DB snapshot shape
type Snapshot = {
  id: number;
  reportId: number;
  snapshotData: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'denied';

  // Signature metadata from schema
  signatureName?: string | null;
  signatureMethod?: string | null;
  signatureUrl?: string | null;
  approvedAt?: string | null;
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

export default function ReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<FullReport | null>(
    null,
  );
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI summary state
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // 1️⃣ Load approved snapshots
  useEffect(() => {
    async function loadSnapshots() {
      try {
        if (!id) throw new Error('Missing report ID in URL.');

        const res = await fetch(`/api/reports/${id}/snapshots`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch snapshots');

        const allSnaps: Snapshot[] = await res.json();

        // Ensure only approved snapshots are used
        const approved = allSnaps.filter((s) => s.status === 'approved');

        setSnapshots(approved);

        const latest = approved[0];
        if (latest) {
          const parsed = JSON.parse(latest.snapshotData);
          setSelectedSnapshot(parsed);
          setSelectedSnapshotId(latest.id);
        } else {
          setSelectedSnapshot(null);
          setSelectedSnapshotId(null);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load snapshots.');
      } finally {
        setLoading(false);
      }
    }

    void loadSnapshots();
  }, [id]);

  // 2️⃣ Generate AI summary for the report using reportId
  useEffect(() => {
    async function generateSummary() {
      if (!id) return;
      if (!selectedSnapshot) {
        setSummary('');
        return;
      }

      setSummaryLoading(true);
      setSummaryError('');

      try {
        const res = await fetch('/api/ai/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId: Number(id) }),
        });

        const data = await res.json();
        if (!res.ok || !data.summary) {
          throw new Error(data.error || 'Failed to generate summary');
        }

        setSummary(data.summary);
      } catch (err: any) {
        console.error('AI summary error:', err);
        setSummaryError(
          'AI summary is not available at this time. Please review the report details below.',
        );
        setSummary('');
      } finally {
        setSummaryLoading(false);
      }
    }

    void generateSummary();
  }, [id, selectedSnapshot]);

  const handleSnapshotSelect = (snapshotId: number) => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return;

    try {
      const parsed = JSON.parse(snap.snapshotData);
      setSelectedSnapshot(parsed);
      setSelectedSnapshotId(snap.id);
    } catch (err) {
      console.error(err);
      setError('Error parsing snapshot data.');
    }
  };

  const componentRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: selectedSnapshot?.name
      ? `${selectedSnapshot.name} Report`
      : 'Report',
  });

  if (loading) {
    return <p className="p-6 text-gray-600">Loading snapshots...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!selectedSnapshot) {
    return (
      <p className="p-6 text-gray-600">
        No approved snapshot is currently available for this report.
      </p>
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

  // Active snapshot meta (for signature and date)
  const activeSnapshot =
    (selectedSnapshotId &&
      snapshots.find((s) => s.id === selectedSnapshotId)) ||
    snapshots[0];

  // ========= CHART DATA HELPERS =========

  // 💰 Financial bar chart
  const chartData: ChartData<'bar'> | null = financialData
    ? {
        labels: ['Original Contract', 'Paid to Date'],
        datasets: [
          {
            label: 'Amount ($)',
            data: [
              Number(financialData.originalContractAmt ?? 0),
              Number(financialData.paidToDate ?? 0),
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

    // Use snapshot date as reference if available, else submittedAt, else "today"
    const referenceDate =
      (activeSnapshot?.createdAt && new Date(activeSnapshot.createdAt)) ||
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
      // Positive = days remaining, Negative = days past due
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
    indexAxis: 'y', // horizontal
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
            'rgba(239,68,68,0.8)', // red
            'rgba(34,197,94,0.8)', // green
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

  const snapshotTakenDate = activeSnapshot?.createdAt ?? submittedAt ?? '';

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="rounded-md bg-[#2FB8AC] px-4 py-2 text-white shadow hover:bg-[#00796B]"
        >
          Export as PDF
        </button>
      </div>
      <div className="space-y-10 p-6 md:p-10" ref={componentRef}>
        {/* 🔹 AI Summary */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#B8E6E0] bg-gradient-to-r from-[#E0F7F5] to-[#F5FBFF] p-4 shadow-sm">
          <div className="mt-1">
            <Sparkles className="h-5 w-5 text-[#00796B]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#00796B]">
              AI Overview
            </p>
            {summaryLoading ? (
              <p className="mt-1 text-sm text-gray-600">
                Generating a brief summary of this report...
              </p>
            ) : summaryError ? (
              <p className="mt-1 text-sm text-gray-500">{summaryError}</p>
            ) : summary ? (
              <p className="mt-1 text-sm text-gray-800">{summary}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Summary not available for this snapshot.
              </p>
            )}
          </div>
        </div>

        {/* 🔹 Header & Signature */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              {name || 'Untitled Report'}
            </h1>
            <p className="mt-1 text-gray-600">
              Department:{' '}
              <span className="font-medium">{department || '—'}</span> · Start:{' '}
              {startDate ? formatDate(startDate) : '—'}
            </p>

            {/* Snapshot selector */}
            {snapshots.length > 0 && (
              <div className="mt-4">
                <label className="mb-1 block text-xs text-gray-600">
                  📅 View older approved monthly reports:
                </label>
                <select
                  value={selectedSnapshotId ?? snapshots[0]?.id}
                  onChange={(e) =>
                    handleSnapshotSelect(Number(e.target.value))
                  }
                  className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-teal-500"
                >
                  {snapshots.map((snap) => (
                    <option key={snap.id} value={snap.id}>
                      {formatDate(snap.createdAt)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => router.push('/reports')}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Back to Reports
            </button>

            {/* ✅ Signature / Approval badge */}
            {activeSnapshot?.signatureUrl && activeSnapshot.signatureName && (
              <div className="mt-1 flex w-[230px] flex-col items-end gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-sm">
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
            <h2 className="mb-1 text-lg font-semibold">General Information</h2>
            <p className="text-sm text-gray-600">
              Department: {department || '—'}
            </p>
            <p className="text-sm text-gray-600">
              Start Date: {startDate ? formatDate(startDate) : '—'}
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
                        financialData.originalContractAmt ?? 0,
                      ).toLocaleString()}
                    </span>
                  </p>
                  <p className="mb-3 text-sm text-gray-600">
                    Paid to Date:{' '}
                    <span className="font-semibold">
                      $
                      {Number(
                        financialData.paidToDate ?? 0,
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
                  Distribution of open vs closed issues in this report.
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
                    Risk: {issue.overallRisk ?? 0}/10
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
            <Calendar className="text-amber-600" /> Schedule & Scope
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
                      Days remaining (or past due) until each milestone target
                      date, relative to the snapshot date.
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
    </div>
  );
}