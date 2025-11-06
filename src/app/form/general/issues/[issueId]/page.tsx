'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReportDraft } from '~/components/report-draft-provider';

export default function IssuePage() {
  const params = useParams();

  // Ensure the param is always a string, never undefined
  const raw = Array.isArray(params?.issueId)
    ? params.issueId[0]
    : params?.issueId;

// always end up with a string
  const issueId = raw ?? '';

  return <IssueInner issueId={issueId} />;
}

function IssueInner({ issueId }: { issueId: string }) {
  const router = useRouter();
  const { draft, setDraft } = useReportDraft();

  const idx = draft.issues.findIndex((i, n) =>
    i.id ? i.id.toString() === issueId : n.toString() === issueId
  );
  const issue = draft.issues[idx];

  function update(field: string, value: any) {
    setDraft((d) => {
      const copy = [...d.issues];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...d, issues: copy };
    });
  }

  if (!issue) return <p>Issue not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit Issue</h1>
      <p className="text-gray-600 mt-1">Update details for this specific issue.</p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full mt-1 border rounded-lg px-3 py-2"
            rows={4}
            value={issue.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="w-full mt-1 border rounded-lg px-3 py-2"
            value={issue.startDate ?? ''}
            onChange={(e) => update('startDate', e.target.value)}
          />

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium">Impact</label>
              <select
                className="w-full mt-1 border rounded-lg px-2 py-2"
                value={issue.impact ?? 'low'}
                onChange={(e) =>
                  update('impact', e.target.value as 'low' | 'medium' | 'high')
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Likelihood</label>
              <select
                className="w-full mt-1 border rounded-lg px-2 py-2"
                value={issue.likelihood ?? 'low'}
                onChange={(e) =>
                  update('likelihood', e.target.value as 'low' | 'medium' | 'high')
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Overall Risk (0–10)</label>
              <input
                type="number"
                min={0}
                max={10}
                className="w-full mt-1 border rounded-lg px-2 py-2"
                value={issue.overallRisk ?? 0}
                onChange={(e) => update('overallRisk', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium">Recommendation</label>
            <input
              className="w-full mt-1 border rounded-lg px-2 py-2"
              value={issue.recommendation ?? ''}
              onChange={(e) => update('recommendation', e.target.value)}
            />
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium">Status</label>
            <select
              className="w-full mt-1 border rounded-lg px-2 py-2"
              value={issue.status ?? 'open'}
              onChange={(e) =>
                update('status', e.target.value as 'open' | 'closed')
              }
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.push('/form/general/issues')}
          className="px-4 py-2 rounded-lg border"
        >
          Back
        </button>
        <button
          onClick={() => router.push('/form/general/appendix')}
          className="px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
