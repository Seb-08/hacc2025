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

export default function FormLandingClient() {
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

 async function closeReport(id: number) {
  try {
    const res = await fetch(`/api/reports/${id}/status`, { method: "PATCH" });
    if (!res.ok) throw new Error("Failed to close report");

    // refetch the single report from the server
    const updatedReport = await fetch(`/api/reports/${id}`, { cache: 'no-store' });
    const reportData = await updatedReport.json();

    // update UI with server's state
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...reportData } : r
      )
    );
  } catch (err) {
    console.error(err);
  }
}
const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">Project Reports</h1>
      <p className="text-gray-600 mb-8">
        Create new project or open existing projects for editing and submitting monthly reports.
      </p>

      {/* 🔍 Search + Filter */}
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

      {/* 🗂 Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* ➕ New Report */}
        <button
          onClick={() => router.push('/form/general')}
          className="border-2 border-dashed border-teal-400 rounded-2xl flex flex-col items-center justify-center p-10 hover:bg-teal-50 transition h-56"
        >
          <span className="text-5xl text-teal-600 font-bold mb-2">＋</span>
          <span className="text-lg font-semibold text-teal-700">
            Create New Project
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
              
              <div className="dropdown relative">
                <button
                  className="dropbtn text-x bg-base-100 rounded-box w-8 p-2 hover:bg-[#A9A9A9]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenId(openId === r.id ? null : r.id);
                  }}
                >
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/032/048/844/non_2x/three-dot-icon-vector.jpg"
                    className="w-10 h-4 rounded-lg hover:opacity-80 transition"
                  />
                </button>
                <div
                  className={`dropdown-content menu bg-base-100 rounded-xl shadow-lg p-2 w-40 mt-2 absolute right-0 z-50 ${
                    openId === r.id ? "block" : "hidden"
                  }`}
                >
                  <ul>
                    <li>
                      <a
                        href={`/form/general?id=${r.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/form/general?id=${r.id}`);
                        }}
                      >
                        Edit
                      </a>
                    </li>
                    <li>
                      <button
                        className="w-full text-left px-2 py-1 hover:bg-gray-200"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          const confirmed = window.confirm("Are you sure you want to mark this project as closed? This will permanently label your project as completed, conveying that no more updates will be made.");
                          if (!confirmed) return;
                          closeReport(r.id);
                        }}
                      >
                        Mark as Closed
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-sm text-gray-600">
                Department:{' '}
                <span className="font-medium">{r.department || '—'}</span>
              </p>
              {r.startDate && (
                <p className="text-sm text-gray-600">
                  Start:{' '}
                  <span className="font-medium">
                    {new Date(r.startDate).toLocaleDateString()}
                  </span>
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
