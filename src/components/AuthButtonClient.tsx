'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type User = {
  email: string;
  role: 'admin' | 'vendor';
} | null;

type MeResponse =
  | { user: { id: number; email: string; role: 'admin' | 'vendor' } }
  | { user: null }
  | { error: string };

// ---------------- ICONS ----------------

// Circle with person icon
function CirclePersonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'h-5 w-5'}
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" stroke="#002C3E" strokeWidth="2" fill="none" />
      <path
        d="M12 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 7c-2.67 0-5 1.46-5 3.25V19c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-.75C17 16.46 14.67 15 12 15z"
        fill="#002C3E"
      />
    </svg>
  );
}

// Door with exit arrow icon
function DoorExitIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-5 w-5'} viewBox="0 0 24 24">
      <rect
        x="5"
        y="4"
        width="8"
        height="16"
        rx="1"
        ry="1"
        fill="none"
        stroke="#002C3E"
        strokeWidth="2"
      />
      <circle cx="11" cy="12" r="0.9" fill="#002C3E" />
      <path
        d="M14 12h5m-2-3 3 3-3 3"
        fill="none"
        stroke="#002C3E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------- COMPONENT ----------------

export default function AuthButtonClient() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        setUser(null);
        return;
      }

      const data: MeResponse = await res.json();
      if ('user' in data && data.user) {
        setUser({
          email: data.user.email,
          role: data.user.role,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch /api/auth/me', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void fetchMe();
  }, [pathname]);

  async function handleClick() {
    if (loading) return;

    // Not logged in → go to login
    if (!user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      } else {
        router.push('/login');
      }
      return;
    }

    // Logged in → logout → go to homepage
    try {
      await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' });
    } catch (err) {
      console.error('Logout error', err);
    }

    setUser(null);

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.refresh();
      router.push('/');
    }
  }

  const tooltipText = loading ? 'Checking...' : user ? 'Sign out' : 'Sign in';

  return (
    <div className="relative group">
      {/* Main icon button */}
      <button
        onClick={handleClick}
        className="
          flex items-center justify-center
          w-9 h-9 rounded-full
          border border-white
          bg-white/20 hover:bg-white
          transition-all duration-300
        "
      >
        {loading ? (
          <CirclePersonIcon className="h-5 w-5" />
        ) : user ? (
          <DoorExitIcon className="h-5 w-5" />
        ) : (
          <CirclePersonIcon className="h-5 w-5" />
        )}
      </button>

      {/* Fancy dropdown tooltip */}
      <div
        className="
          absolute right-0 mt-2
          px-3 py-1.5 rounded-md
          bg-[#2B8985] text-white text-xs font-medium
          border border-[#2B8985]/70
          shadow-lg shadow-[#2B8985]/30
          whitespace-nowrap min-w-max

          opacity-0 scale-95 translate-y-1
          pointer-events-none
          group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
          group-hover:pointer-events-auto
          transition-all duration-200
        "
      >
        {tooltipText}
      </div>
    </div>
  );
}
