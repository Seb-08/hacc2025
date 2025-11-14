'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  SignatureModal,
  type SignatureData,
} from '~/components/SignatureModal';

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

type MeResponse = {
  user: {
    id: number;
    email: string;
    role: 'admin' | 'vendor';
  } | null;
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
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [snapshots, setSnapshots] = useState<PendingSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  // Signature modal state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // Auth check – only admins allowed
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data: MeResponse = await res.json();
        if (!data.user || data.user.role !== 'admin') {
          router.push('/');
          return;
        }
        setAuthChecked(true);
      } catch (err) {
        console.error('Failed to verify auth for review page', err);
        router.push('/');
      }
    }
    void checkAuth();
  }, [router]);

  // Load pending snapshots
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
    if (authChecked) {
      void loadPending();
    }
  }, [authChecked]);

  function openSignatureFor(id: number) {
    setApprovingId(id);
    setShowSignatureModal(true);
    setActionMessage('');
  }

  // Called when signature modal "Confirm & Attach" is pressed
  async function handleSignatureSave(signature: SignatureData) {
    if (!approvingId) return;

    setShowSignatureModal(false);
    setActionMessage('');
    try {
      const res = await fetch(`/api/review/snapshots/${approvingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve snapshot');
      }

      setActionMessage('✅ Snapshot approved with signature attached');
      setSnapshots((prev) => prev.filter((s) => s.id !== approvingId));
      if (selectedId === approvingId) setSelectedId(null);
      setApprovingId(null);
    } catch (err: any) {
      console.error(err);
      setActionMessage(err?.message ?? 'Error approving snapshot');
      setApprovingId(null);
    }
  }

  async function handleDeny(id: number) {
    setActionMessage('');
    try {
      const res = await fetch(`/api/review/snapshots/${id}/deny`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deny snapshot');
      }
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

  if (!authChecked) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-gray-600">Verifying access…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#002C3E]">
          Snapshot Review Queue
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Review submitted monthly snapshots before they become visible on the
          public reports page. Only <span className="font-semibold">approved</span>{' '}
          snapshots are displayed. Each approval requires a digital signature.
        </p>
        {actionMessage && (
          <p className="text-sm mt-1 text-emerald-700 font-medium">
            {actionMessage}
          </p>
        )}
        {error && (
          <p className="text-sm mt-1 text-red-600 font-medium">{error}</p>
        )}
      </div>

      {/* Empty state */}
      {!loading && snapshots.length === 0 && (
        <div className="mt-6 p-6 bg-white border rounded-2xl shadow-sm text-center text-gray-500">
          <Clock className="mx-auto mb-2 text-gray-400" />
          <p>No pending snapshots at the moment.</p>
        </div>
      )}

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
        {/* Left: list */}
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
                        {summary.issuesCount} issues ·{' '}
                        {summary.milestonesCount} milestones
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </section>

        {/* Right: preview + actions */}
        <section className="bg-white border rounded-2xl shadow-sm p-5 min-h-[260px]">
          {!selectedSnapshot || !parsed ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm">
              <FileText className="w-6 h-6 mb-2 text-gray-400" />
              <p>Select a snapshot on the left to review its contents.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-amber-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Approval
                  </p>
                  <h2 className="text-lg font-semibold text-[#002C3E]">
                    {selectedSnapshot.reportName ||
                      parsed.name ||
                      'Untitled Report'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Dept:{' '}
                    {selectedSnapshot.department ||
                      parsed.department ||
                      '—'}{' '}
                    · Report ID: {selectedSnapshot.reportId}
                  </p>
                  <p className="text-xs text-gray-500">
                    Snapshot Submitted: {formatDate(selectedSnapshot.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => openSignatureFor(selectedSnapshot.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Approve &amp; Sign
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

              {/* Summary row */}
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

              {/* Preview sections (unchanged, compact) */}
              {/* ...your preview blocks stay as you had them... */}
            </>
          )}
        </section>
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