// src/app/form/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FormLanding() {
  const router = useRouter();
  const [existingId, setExistingId] = useState<string>('');

  return (
    <div className="grid gap-6 md:grid-cols-2">
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
            onClick={() => {
              if (!existingId) return;
              // carry the id via query to general step
              const q = new URLSearchParams({ id: existingId });
              router.push(`/form/general?${q.toString()}`);
            }}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
          >
            Load
          </button>
        </div>
      </div>
    </div>
  );
}
