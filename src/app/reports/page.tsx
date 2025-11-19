'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Report = {
  id: number;
  name: string;
  department: string;
  startDate: string | null;
  updatedAt?: string | null;
};

type SortOption = 'newest' | 'oldest' | 'az' | 'za';

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // read initial query from ?q (supports homepage deep-link if ever used)
  const initialQuery = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(initialQuery);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('newest'); // default: newest → oldest

  // Load reports from API
  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) {
          setReports(data);
        }
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // Keep URL in sync when search changes (for shareable links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (search.trim()) {
      params.set('q', search.trim());
    } else {
      params.delete('q');
    }

    const url = `/reports${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', url);
  }, [search]);

  // Build department filter list
  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const r of reports) {
      if (r.department) set.add(r.department);
    }
    return ['all', ...Array.from(set).sort()];
  }, [reports]);

  // Filter + Sort
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    let result = reports.filter((r) => {
      const matchesSearch = term
        ? (r.name || '').toLowerCase().includes(term)
        : true;

      const matchesDept =
        selectedDept === 'all'
          ? true
          : (r.department || '').toLowerCase() === selectedDept.toLowerCase();

      return matchesSearch && matchesDept;
    });

    // Sorting logic
    result = [...result].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();

      // Prefer updatedAt, fallback to startDate, fallback id
      const dateA =
        (a.updatedAt && new Date(a.updatedAt).getTime()) ||
        (a.startDate && new Date(a.startDate).getTime()) ||
        0;
      const dateB =
        (b.updatedAt && new Date(b.updatedAt).getTime()) ||
        (b.startDate && new Date(b.startDate).getTime()) ||
        0;

      switch (sort) {
        case 'newest':
          return dateB - dateA; // latest first
        case 'oldest':
          return dateA - dateB; // oldest first
        case 'az':
          return nameA.localeCompare(nameB);
        case 'za':
          return nameB.localeCompare(nameA);
        default:
          return 0;
      }
    });

    return result;
  }, [reports, search, selectedDept, sort]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-gray-600">Loading reports...</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className = "flex items-center gap-4">
          <button className="btn rounded-box bg-[#032A3A]">          
              <Link href="../">&larr; Back</Link>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#002C3E]">
              Reports Overview
            </h1>
            <p className="text-sm text-gray-600">
              Browse and search IV&V reports across Hawaiʻi ETS projects.
            </p>
          </div>
        </div>

        {/* Search + Filters + Sort */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Search bar (full width, main focus) */}
          <div className="w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name..."
              className="w-full border rounded-full px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2FA8A3]"
            />
          </div>

          {/* Filters row: department (shorter) + sort (compact) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter - shorter width than search */}
            <div className="w-40">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full border rounded-full px-3 py-2 text-xs bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2FA8A3]"
              >
                {departments.map((dept) =>
                  dept === 'all' ? (
                    <option key="all" value="all">
                      All Departments
                    </option>
                  ) : (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Sort control */}
            <div className="w-44">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full border rounded-full px-3 py-2 text-xs bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2FA8A3]"
              >
                <option value="newest">Sort: New → Old</option>
                <option value="oldest">Sort: Old → New</option>
                <option value="az">Sort: A → Z</option>
                <option value="za">Sort: Z → A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 mt-4">
          No reports found
          {search ? (
            <>
              {' '}
              matching “<span className="font-medium">{search}</span>”.
            </>
          ) : (
            '.'
          )}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => (
            <button
              key={report.id}
              onClick={() => router.push(`/reports/view/${report.id}`)}
              className="text-left bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#2FA8A3] transition flex flex-col justify-between"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase text-[#2FA8A3]">
                  View
                </p>
                <h2 className="text-lg font-semibold text-[#002C3E] line-clamp-2">
                  {report.name || 'Untitled Report'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Dept: {report.department || '—'}
                </p>
                <p className="text-xs text-gray-500">
                  Start:{' '}
                  {report.startDate
                    ? new Date(report.startDate).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div className="mt-3 text-[10px] text-gray-400">
                Last updated:{' '}
                {report.updatedAt
                  ? new Date(report.updatedAt).toLocaleDateString()
                  : '—'}
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
