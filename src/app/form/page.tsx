'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FormLanding() {
  const router = useRouter();
  const [existingId, setExistingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLoad() {
    setError('');
    if (!existingId.trim()) {
      setError('Please enter a Report ID.');
      return;
    }

    try {
      setLoading(true);
      // check that the report actually exists before routing
      const res = await fetch(`/api/reports/${existingId}`, { cache: 'no-store' });
      if (!res.ok) {
        setError('Report not found. Please check the ID.');
        return;
      }

      // everything good → go to general page with ?id
      router.push(`/form/general?id=${existingId}`);
    } catch (e) {
      setError('Failed to load report.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* New Report */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-xl font-semibold">Create a New Report</h2>
        <p className="text-sm text-gray-600 mt-2">Start a fresh report and fill out each section.</p>
        <button
          onClick={() => router.push('/form/general')}
          className="mt-4 px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          Start New Report
        </button>
      </div>

      {/* Existing Report */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-xl font-semibold">Edit Existing Report</h2>
        <p className="text-sm text-gray-600 mt-2">Enter a Report ID to load the latest data for editing.</p>

        <div className="mt-4 flex gap-2">
          <input
            value={existingId}
            onChange={(e) => setExistingId(e.target.value)}
            placeholder="Report ID"
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            onClick={handleLoad}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
          >
            {loading ? 'Loading…' : 'Load'}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
