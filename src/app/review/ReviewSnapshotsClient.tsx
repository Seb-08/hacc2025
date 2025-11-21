'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, XCircle, Search } from 'lucide-react';

type SnapshotStatus = 'pending' | 'approved' | 'denied';

type ReviewSnapshot = {
  id: number;
  reportId: number;
  status: SnapshotStatus;
  createdAt: string;
  snapshotData: string;
  reportName: string;
  department: string;
  reportStartDate: string | null;
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

function getIssuesAndMilestones(snapshotData: string) {
  try {
    const parsed = JSON.parse(snapshotData);
    const issuesCount = Array.isArray(parsed.issues) ? parsed.issues.length : 0;
    const milestonesCount = Array.isArray(parsed.scheduleScope)
      ? parsed.scheduleScope.length
      : 0;
    return { issuesCount, milestonesCount };
  } catch {
    return { issuesCount: 0, milestonesCount: 0 };
  }
}

function getStatusConfig(status: SnapshotStatus) {
  switch (status) {
    case 'approved':
      return {
        label: 'Approved',
        Icon: CheckCircle2,
        className: 'text-emerald-600 bg-emerald-50',
      };
    case 'denied':
      return {
        label: 'Denied',
        Icon: XCircle,
        className: 'text-red-600 bg-red-50',
      };
    default:
      return {
        label: 'Pending',
        Icon: Clock,
        className: 'text-amber-600 bg-amber-50',
      };
  }
}

export default function ReviewSnapshotsClient() {
  const router = useRouter();

  const [snapshots, setSnapshots] = useState<ReviewSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SnapshotStatus>(
    'all',
  );

  // Load all snapshots
  useEffect(() => {
    async function loadSnapshots() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/review/snapshots', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load snapshots');
        const data = await res.json();
        setSnapshots(data || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? 'Error loading snapshots');
      } finally {
        setLoading(false);
      }
    }

    void loadSnapshots();
  }, []);

  const filteredSnapshots = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return snapshots.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!q) return true;

      const target =
        `${s.reportName || ''} ${s.department || ''} ${s.reportId} ${s.status}`.toLowerCase();

      return target.includes(q);
    });
  }, [snapshots, searchQuery, statusFilter]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-[#002C3E]">
          Snapshot Review Queue
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Browse all report snapshots. Use search and filters to quickly find a
          specific project, then click a row to open the full-screen review
          view.
        </p>
        {error && (
          <p className="text-sm mt-1 text-red-600 font-medium">{error}</p>
        )}
      </header>

      {/* Controls */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by report name, department, ID, or status…"
            className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FA8A3]/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            className="border border-gray-300 rounded-full px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#2FA8A3]/60"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | SnapshotStatus)
            }
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending only</option>
            <option value="approved">Approved only</option>
            <option value="denied">Denied only</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="text-xs md:text-sm text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* Table-style list */}
      <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 text-[11px] md:text-xs text-gray-500">
          <div className="flex-1">Report</div>
          <div className="hidden md:block w-32 text-center">Department</div>
          <div className="hidden md:block w-24 text-center">Status</div>
          <div className="hidden md:block w-28 text-center">Created</div>
          <div className="w-24 text-center">Issues · Miles.</div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-gray-600">Loading…</div>
        ) : filteredSnapshots.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-600">
            No snapshots match your filters.
          </div>
        ) : (
          <ul className="divide-y">
            {filteredSnapshots.map((snap) => {
              const { issuesCount, milestonesCount } = getIssuesAndMilestones(
                snap.snapshotData,
              );
              const { label, Icon, className } = getStatusConfig(snap.status);

              return (
                <li key={snap.id}>
                  <button
                    onClick={() => router.push(`/review/${snap.id}`)}
                    className="w-full flex items-center px-4 py-3 text-left text-xs md:text-sm hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 pr-3">
                      <p className="font-semibold text-[#002C3E] line-clamp-1">
                        {snap.reportName || 'Untitled Report'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        ID: {snap.reportId} · Start:{' '}
                        {formatDate(snap.reportStartDate)}
                      </p>
                    </div>

                    <div className="hidden md:block w-32 text-center text-[11px] text-gray-600">
                      {snap.department || '—'}
                    </div>

                    <div className="hidden md:flex w-24 justify-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${className}`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                    </div>

                    <div className="hidden md:block w-28 text-center text-[11px] text-gray-600">
                      {formatDate(snap.createdAt)}
                    </div>

                    <div className="w-24 text-center text-[11px] text-gray-600">
                      {issuesCount} · {milestonesCount}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
