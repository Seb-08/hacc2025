'use client';

import { useRouter } from 'next/navigation';
import { useReportDraft } from '~/components/report-draft-provider';

export default function GeneralPage() {
  const { draft, setDraft } = useReportDraft();
  const router = useRouter();

  function updateGeneral(field: string, value: string) {
    setDraft((d) => ({ ...d, general: { ...d.general, [field]: value } }));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">General Information</h1>
      <p className="text-gray-600 mt-1">
        Fill out the core details for this report before moving to issues or schedule.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div>
          <label className="text-sm font-medium">Project/Report Name</label>
          <input
            className="w-full mt-1 border rounded-lg px-3 py-2"
            value={draft.general.name ?? ''}
            onChange={(e) => updateGeneral('name', e.target.value)}
            placeholder="e.g., Network Modernization Q1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Department</label>
          <input
            className="w-full mt-1 border rounded-lg px-3 py-2"
            value={draft.general.department ?? ''}
            onChange={(e) => updateGeneral('department', e.target.value)}
            placeholder="e.g., ETS"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="w-full mt-1 border rounded-lg px-3 py-2"
            value={draft.general.startDate ?? ''}
            onChange={(e) => updateGeneral('startDate', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => router.push('/form/general/issues')}
          className="px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          Continue to Issues
        </button>
      </div>
    </div>
  );
}
