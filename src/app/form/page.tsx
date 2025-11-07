'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type ReportSummary = {
  id: number;
  name: string;
  department: string;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function FormLanding() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    let filtered = reports;
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(
        (r) => r.department?.toLowerCase() === departmentFilter.toLowerCase()
      );
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter((r) => r.name?.toLowerCase().includes(term));
    }
    return filtered;
  }, [reports, search, departmentFilter]);

  const departments = useMemo(() => {
    const set = new Set(reports.map((r) => r.department).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [reports]);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">Project Reports</h1>
      <p className="text-gray-600 mb-8">
        Create new reports or open existing ones for editing and submission.
      </p>

      {/* 🔍 Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project name..."
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full sm:w-56"
        >
          {departments.map((dep) => (
            <option key={dep} value={dep}>
              {dep === 'All' ? 'All Departments' : dep}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading reports…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* 🗂 Grid of Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* ➕ New Report Card */}
        <button
          onClick={() => router.push('/form/general')}
          className="border-2 border-dashed border-teal-400 rounded-2xl flex flex-col items-center justify-center p-10 hover:bg-teal-50 transition h-56"
        >
          <span className="text-5xl text-teal-600 font-bold mb-2">＋</span>
          <span className="text-lg font-semibold text-teal-700">
            Create New Report
          </span>
          <p className="text-gray-500 text-sm mt-1">Start from scratch</p>
        </button>

        {/* 📄 Existing Reports */}
        {filteredReports.map((r) => (
          <div
            key={r.id}
            onClick={() => router.push(`/form/general?id=${r.id}`)}
            className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-400 cursor-pointer transition flex flex-col justify-between h-56"
          >
            <div className="flex justify-between items-start">
              <h2 className="font-semibold text-gray-800 text-xl truncate">
                {r.name || `Untitled Report #${r.id}`}
              </h2>
              <span className="text-xs bg-teal-100 text-teal-700 font-medium px-2 py-1 rounded-md">
                Edit
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-sm text-gray-600">
                Department: <span className="font-medium">{r.department || '—'}</span>
              </p>
              {r.startDate && (
                <p className="text-sm text-gray-600">
                  Start: <span className="font-medium">{new Date(r.startDate).toLocaleDateString()}</span>
                </p>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
              <span>ID: {r.id}</span>
              <span>
                {r.updatedAt
                  ? `Updated ${new Date(r.updatedAt).toLocaleDateString()}`
                  : r.createdAt
                  ? `Created ${new Date(r.createdAt).toLocaleDateString()}`
                  : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && filteredReports.length === 0 && (
        <p className="text-gray-500 text-sm mt-6">
          No reports match your search or filter.
        </p>
      )}
    </div>
  );
}
