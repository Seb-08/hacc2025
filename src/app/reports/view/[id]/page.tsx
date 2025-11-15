'use client';

import { useEffect, useState } from 'react';
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
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import '~/lib/chartSetup';
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

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
  const [selectedSnapshot, setSelectedSnapshot] = useState<FullReport | null>(null);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);

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
    : "Report",
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

  // Chart data (no hooks)
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

  const snapshotTakenDate =
    activeSnapshot?.createdAt ?? submittedAt ?? '';

  return (
    <div>
       <div className="flex justify-end mb-4">
        <button
        onClick={handlePrint}
        className="px-4 py-2 bg-[#2FB8AC] text-white rounded-md shadow hover:bg-[#00796B]">
        Export as PDF
      </button>
      </div>
    <div className="p-6 md:p-10 space-y-10" ref={componentRef}>
      {/* 🔹 AI Summary */}
      <div className="bg-gradient-to-r from-[#E0F7F5] to-[#F5FBFF] border border-[#B8E6E0] rounded-2xl p-4 flex gap-3 items-start shadow-sm">
        <div className="mt-1">
          <Sparkles className="w-5 h-5 text-[#00796B]" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#00796B] font-semibold">
            AI Overview
          </p>
          {summaryLoading ? (
            <p className="text-sm text-gray-600 mt-1">
              Generating a brief summary of this report...
            </p>
          ) : summaryError ? (
            <p className="text-sm text-gray-500 mt-1">{summaryError}</p>
          ) : summary ? (
            <p className="text-sm text-gray-800 mt-1">{summary}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Summary not available for this snapshot.
            </p>
          )}
        </div>
      </div>

      {/* 🔹 Header & Signature */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">
            {name || 'Untitled Report'}
          </h1>
          <p className="text-gray-600 mt-1">
            Department:{' '}
            <span className="font-medium">{department || '—'}</span> · Start:{' '}
            {startDate ? formatDate(startDate) : '—'}
          </p>

          {/* Snapshot selector */}
          {snapshots.length > 0 && (
            <div className="mt-4">
              <label className="text-xs text-gray-600 mb-1 block">
                📅 View older approved monthly reports:
              </label>
              <select
                value={selectedSnapshotId ?? snapshots[0]?.id}
                onChange={(e) =>
                  handleSnapshotSelect(Number(e.target.value))
                }
                className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-teal-500"
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
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            Back to Reports
          </button>

          {/* ✅ Signature / Approval badge */}
          {activeSnapshot?.signatureUrl && activeSnapshot.signatureName && (
            <div className="mt-1 bg-white border border-emerald-200 rounded-xl px-3 py-2 shadow-sm flex flex-col items-end gap-1 w-[230px]">
              <div className="flex items-center gap-1 text-emerald-700 text-[10px] font-semibold uppercase">
                <CheckCircle2 className="w-3 h-3" />
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
              <div className="mt-1 w-full flex justify-end">
                <div className="border border-gray-200 rounded-md bg-gray-50 p-1 max-h-[52px] max-w-[150px] overflow-hidden flex items-center justify-center">
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
        <div className="p-6 rounded-xl border bg-white shadow-sm flex flex-col items-start">
          <Flag className="text-teal-600 mb-3" />
          <h2 className="font-semibold text-lg mb-1">General Information</h2>
          <p className="text-gray-600 text-sm">
            Department: {department || '—'}
          </p>
          <p className="text-gray-600 text-sm">
            Start Date: {startDate ? formatDate(startDate) : '—'}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Snapshot Taken: {formatDate(snapshotTakenDate)}
          </p>
        </div>

        {/* Financial Summary (wide) */}
        <div className="p-6 rounded-xl border bg-white shadow-sm flex flex-col lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="text-green-600" />
            <h2 className="font-semibold text-lg">Financial Summary</h2>
          </div>

          {financialData ? (
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              <div className="flex-1">
                <p className="text-gray-600 text-sm mb-1">
                  Original Contract:{' '}
                  <span className="font-semibold">
                    $
                    {Number(
                      financialData.originalContractAmt ?? 0,
                    ).toLocaleString()}
                  </span>
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  Paid to Date:{' '}
                  <span className="font-semibold">
                    $
                    {Number(
                      financialData.paidToDate ?? 0,
                    ).toLocaleString()}
                  </span>
                </p>
                <p className="text-gray-500 text-xs">
                  This chart compares the total contract value with payments made
                  to date for a quick snapshot of financial health.
                </p>
              </div>
              <div className="flex-1 flex items-center">
                {chartData && (
                  <div className="w-full h-56">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No financial data.</p>
          )}
        </div>
      </div>

      {/* 🔹 Issues */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ClipboardList className="text-indigo-600" /> All Issues
        </h2>
        {!issues.length ? (
          <p className="text-gray-500">No issues recorded.</p>
        ) : (
          <div className="grid gap-4">
            {issues.map((issue: any, i: number) => (
              <div
                key={issue.id ?? i}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <h3 className="font-medium text-gray-800 mb-1">
                  Issue {i + 1}: {issue.description || 'No description'}
                </h3>
                <p className="text-sm text-gray-600">
                  Impact: {issue.impact} · Likelihood: {issue.likelihood} · Risk:{' '}
                  {issue.overallRisk ?? 0}/10
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Recommendation: {issue.recommendation || '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: {issue.status} · Start:{' '}
                  {issue.startDate ? formatDate(issue.startDate) : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 Schedule & Scope */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="text-amber-600" /> Schedule & Scope
        </h2>
        {!scheduleScope.length ? (
          <p className="text-gray-500">No milestones recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-t">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">Task</th>
                  <th className="text-left px-3 py-2">Target Date</th>
                  <th className="text-left px-3 py-2">% Complete</th>
                  <th className="text-left px-3 py-2">Notes</th>
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
                      {row.targetDate
                        ? formatDate(row.targetDate)
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {row.completionPercent ?? 0}%
                    </td>
                    <td className="px-3 py-2">
                      {row.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔹 Appendix */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-purple-600" /> Appendix
        </h2>
        {!appendix[0]?.content ? (
          <p className="text-gray-500">No appendix notes provided.</p>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">
            {appendix[0].content}
          </p>
        )}
      </div>
    </div>
    </div>
  );
}
