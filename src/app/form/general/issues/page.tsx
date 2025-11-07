'use client';

import { useRouter } from 'next/navigation';
import { useReportDraft } from '~/components/report-draft-provider';

// local DraftIssue type to keep file self-contained
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

export default function IssuesPage() {
  const { draft, setDraft, isLoading } = useReportDraft();
  const router = useRouter();

  function createNewIssue() {
    setDraft((prev) => {
      const newIssue: DraftIssue = {
        description: '',
        startDate: '',
        impact: 'low',
        likelihood: 'low',
        overallRisk: 0,
        recommendation: '',
        status: 'open',
      };

      const updated = { ...prev, issues: [...prev.issues, newIssue] } as typeof prev;

      // Route after state is queued; always use INDEX
      const newIndex = updated.issues.length - 1;
      setTimeout(() => router.push(`/form/general/issues/${newIndex}`), 0);

      return updated;
    });
  }

  if (isLoading) {
    return <p className="text-gray-600">Loading issues…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Issues</h1>
      <p className="text-gray-600 mt-1">Select an issue to edit or create a new one.</p>

      <div className="mt-6 flex justify-between">
        <h2 className="text-lg font-medium">Existing Issues</h2>
        <button
          onClick={createNewIssue}
          className="px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          + Add Issue
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {draft.issues.length === 0 && (
          <p className="text-sm text-gray-600">
            No issues yet. Click “Add Issue” to create one.
          </p>
        )}

        {draft.issues.map((issue, idx) => (
          <button
            key={issue.id ?? idx}
            onClick={() => router.push(`/form/general/issues/${idx}`)} // ✅ fixed bracket
            className="w-full text-left border rounded-lg p-3 hover:bg-gray-50 transition"
          >
            <h3 className="font-medium">
              {issue.description ? issue.description.slice(0, 40) : `Issue ${idx + 1}`}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Impact: {issue.impact ?? 'low'} | Likelihood: {issue.likelihood ?? 'low'} | Status:{' '}
              {issue.status ?? 'open'}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => router.back()} className="px-4 py-2 rounded-lg border">
          Back
        </button>
        <button
          onClick={() => router.push('/form/general/schedule')}
          className="px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          Continue to Schedule & Scope
        </button>
      </div>
    </div>
  );
}
