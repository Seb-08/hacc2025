'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [highlighted, setHighlighted] = useState<number>(-1);

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
        ? ((r.name || '').toLowerCase().includes(term) ||
           (r.department || '').toLowerCase().includes(term))
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

  // Suggestions (for autosuggest dropdown) — show matches by name or department
  const suggestions = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return [];

    const matches = reports
      .filter((r) => {
        return (
          (r.name || '').toLowerCase().includes(term) ||
          (r.department || '').toLowerCase().includes(term)
        );
      })
      // prefer name matches first
      .sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        const nameScoreA = aName.includes(term) ? 0 : 1;
        const nameScoreB = bName.includes(term) ? 0 : 1;
        return nameScoreA - nameScoreB;
      })
      .slice(0, 7);

    return matches;
  }, [reports, search]);

  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setHighlighted(-1);
      }
    }

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Handle keyboard navigation in search input
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlighted >= 0 && highlighted < suggestions.length) {
        const selected = suggestions[highlighted];
        if (selected) {
          router.push(`/reports/view/${selected.id}`);
        }
      }
    } else if (e.key === 'Escape') {
      setHighlighted(-1);
    }
  }

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
        <h1 className="text-3xl font-bold text-[#002C3E]">
          Reports Overview
        </h1>
        <p className="text-sm text-gray-600">
          Browse and search IV&V reports across Hawaiʻi ETS projects.
        </p>

        {/* Search + Filters + Sort */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Search bar (full width, main focus) */}
          <div className="w-full relative">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlighted(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by project name or department..."
              className="w-full border rounded-full px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2FA8A3]"
            />

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && highlighted >= -1 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-20 overflow-hidden"
              >
                {suggestions.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseEnter={() => setHighlighted(idx)}
                    onMouseLeave={() => setHighlighted(-1)}
                    onClick={() => {
                      router.push(`/reports/view/${s.id}`);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      highlighted === idx ? 'bg-gray-100' : ''
                    }`
                    }
                  >
                    <div className="font-medium text-[#002C3E] line-clamp-1">
                      {s.name || 'Untitled Report'}
                    </div>
                    <div className="text-xs text-gray-500">{s.department || '—'}</div>
                  </button>
                ))}
              </div>
            )}
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
