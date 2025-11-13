'use client';

import { useRouter } from 'next/navigation';
import { useReportDraft } from '~/components/report-draft-provider';

export default function FinancialPage() {
  const { draft, setDraft } = useReportDraft();
  const router = useRouter();

  function update(field: 'originalContractAmt' | 'paidToDate', value: string) {
    setDraft((d) => ({
      ...d,
      financial: {
        id: d.financial?.id,
        originalContractAmt:
          field === 'originalContractAmt'
            ? value
            : d.financial?.originalContractAmt ?? '',
        paidToDate:
          field === 'paidToDate' ? value : d.financial?.paidToDate ?? '',
      },
    }));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Financials</h1>
      <p className="text-gray-600 mt-1">
        Track contract amount and paid-to-date values.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="text-sm font-medium">Original Contract Amount</label>
          <input
            type="number"
            className="w-full mt-1 border rounded-lg px-3 py-2"
            value={draft.financial?.originalContractAmt ?? ''}
            onChange={(e) => update('originalContractAmt', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Paid to Date</label>
          <input
            type="number"
            className="w-full mt-1 border rounded-lg px-3 py-2"
            value={draft.financial?.paidToDate ?? ''}
            onChange={(e) => update('paidToDate', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg border"
        >
          Back
        </button>
        <button
          onClick={() => router.push('/form/general/appendix')}
          className="px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          Continue to Appendix & Submit
        </button>
      </div>
    </div>
  );
}