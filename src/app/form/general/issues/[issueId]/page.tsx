// src/app/form/general/issues/[issueId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReportDraft } from '~/components/report-draft-provider';

type Level = 'low' | 'medium' | 'high';

function calculateRisk(impact?: Level, likelihood?: Level) {
  const score = (level?: Level) => {
    switch (level) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
      default:
        return 1;
    }
  };

  return score(impact) + score(likelihood); // 2–6
}

export default function IssuePage() {
  const params = useParams();

  // Always ensure a string param
  const raw = Array.isArray(params?.issueId) ? params.issueId[0] : params?.issueId;
  const issueId = raw ?? '';

  return <IssueInner issueIndexParam={issueId} />;
}

function IssueInner({ issueIndexParam }: { issueIndexParam: string }) {
  const router = useRouter();
  const { draft, setDraft, isLoading } = useReportDraft();

  // Side-nav and list both use index in the href (/issues/${idx})
  const idx = Number(issueIndexParam);
  const idxValid = Number.isInteger(idx) && idx >= 0;

  // Wait until provider loads the draft before checking
  if (isLoading) return <p>Loading issue…</p>;
  if (!idxValid || idx >= draft.issues.length) return <p>Issue not found.</p>;

  const issue = draft.issues[idx]!; // Non-null after validation

  function update(field: string, value: any) {
    setDraft((d) => {
      const copy = [...d.issues];
      const current: any = { ...copy[idx], [field]: value };

      // Always keep overallRisk in sync with impact + likelihood
      const impact = (current.impact ?? 'low') as Level;
      const likelihood = (current.likelihood ?? 'low') as Level;
      current.overallRisk = calculateRisk(impact, likelihood);

      copy[idx] = current;
      return { ...d, issues: copy };
    });
  }

  const calculatedRisk = calculateRisk(
    (issue.impact ?? 'low') as Level,
    (issue.likelihood ?? 'low') as Level,
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Edit Issue {idx + 1}</h1>
      <p className="text-gray-600 mt-1">Update details for this specific issue.</p>

      {/* Layout: Description left, Recommendation (bigger) + fields right */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* LEFT COLUMN — DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="w-full mt-1 border rounded-lg px-3 py-2"
            rows={10}
            value={issue.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        {/* RIGHT COLUMN — RECOMMENDATION + META */}
        <div>
          {/* Bigger recommendation box, at the top on the right */}
          <div>
            <label className="text-sm font-medium">Recommendation</label>
            <textarea
              className="w-full mt-1 border rounded-lg px-3 py-2"
              rows={6}
              value={issue.recommendation ?? ''}
              onChange={(e) => update('recommendation', e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              className="w-full mt-1 border rounded-lg px-3 py-2"
              value={issue.startDate ?? ''}
              onChange={(e) => update('startDate', e.target.value)}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
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

            {/* 🔒 Read-only, auto-calculated risk */}
            <div>
              <label className="text-xs font-medium">Overall Risk (out of 6)</label>
              <div className="w-full mt-1 border rounded-lg px-2 py-2 bg-gray-50 text-sm">
                {calculatedRisk} / 6
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Calculated as Impact + Likelihood (Low = 1, Medium = 2, High = 3).
              </p>
            </div>
          </div>

          <div className="mt-4">
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

      {/* ✅ Only one "Done" button now */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => router.push('/form/general/issues')}
          className="px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
